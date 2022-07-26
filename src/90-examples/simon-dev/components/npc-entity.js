import * as THREE from '/node_modules/three127/build/three.module.js'

import { Component } from '../ecs/component.js'
import { CharacterFSM } from './player-entity.js'
import { CHARACTER_MODELS } from '../03-MMORPG/shared/data.mjs'
import { scene } from '/utils/scene.js'

export class NPCController extends Component {
  constructor({ desc }) {
    super()
    this.params = { desc }
  }

  Destroy() {
    this.group_.traverse(c => {
      if (c.material) {
        let materials = c.material
        if (!(c.material instanceof Array))
          materials = [c.material]
        for (const m of materials)
          m.dispose()
      }

      if (c.geometry)
        c.geometry.dispose()
    })
    scene.remove(this.group_)
  }

  InitEntity() {
    this.Init()
  }

  Init() {
    this.animations = {}
    this.group_ = new THREE.Group()

    scene.add(this.group_)
    this.queuedState_ = null

    this.LoadModels_()
  }

  InitComponent() {
    this.RegisterHandler('health.death', m => this.OnDeath_(m))
    this.RegisterHandler('update.position', m => this.OnPosition_(m))
    this.RegisterHandler('update.rotation', m => this.OnRotation_(m))
  }

  SetState(s) {
    if (!this.stateMachine) {
      this.queuedState_ = s
      return
    }

    // hack: should propogate attacks through the events on server
    // Right now, they're inferred from whatever animation we're running, blech
    if (s == 'attack' && this.stateMachine.currentState.Name != 'attack')
      this.Broadcast({
        topic: 'action.attack',
      })

    this.stateMachine.SetState(s)
  }

  OnDeath_() {
    this.SetState('death')
  }

  OnPosition_(m) {
    this.group_.position.copy(m.value)
  }

  OnRotation_(m) {
    this.group_.quaternion.copy(m.value)
  }

  LoadModels_() {
    const classType = this.params.desc.character.class
    const modelData = CHARACTER_MODELS[classType]

    const loader = this.FindEntity('loader').GetComponent('LoadController')
    loader.LoadSkinnedGLB(modelData.path, modelData.base, glb => {
      this.target = glb.scene
      this.target.scale.setScalar(modelData.scale)
      this.target.visible = false

      this.group_.add(this.target)

      this.bones_ = {}
      this.target.traverse(c => {
        if (!c.skeleton)
          return

        for (const b of c.skeleton.bones)
          this.bones_[b.name] = b
      })

      this.target.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
        if (c.material && c.material.map)
          c.material.map.encoding = THREE.sRGBEncoding
      })

      this.mixer = new THREE.AnimationMixer(this.target)

      const _FindAnim = animName => {
        for (let i = 0; i < glb.animations.length; i++)
          if (glb.animations[i].name.includes(animName)) {
            const clip = glb.animations[i]
            const action = this.mixer.clipAction(clip)
            return {
              clip,
              action
            }
          }
        return null
      }

      this.animations.idle = _FindAnim('Idle')
      this.animations.walk = _FindAnim('Walk')
      this.animations.run = _FindAnim('Run')
      this.animations.death = _FindAnim('Death')
      this.animations.attack = _FindAnim('Attack')
      this.animations.dance = _FindAnim('Dance')

      this.target.visible = true

      this.stateMachine = new CharacterFSM(this.animations)

      if (this.queuedState_) {
        this.stateMachine.SetState(this.queuedState_)
        this.queuedState_ = null
      } else
        this.stateMachine.SetState('idle')

      this.Broadcast({
        topic: 'load.character',
        model: this.group_,
        bones: this.bones_,
      })
    })
  }

  Update(timeInSeconds) {
    if (!this.stateMachine) return

    this.stateMachine.Update(timeInSeconds, null)

    if (this.mixer)
      this.mixer.update(timeInSeconds)
  }
}
