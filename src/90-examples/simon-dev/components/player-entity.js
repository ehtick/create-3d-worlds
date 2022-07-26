import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene } from '/utils/scene.js'
import keyboard from '/classes/Keyboard.js'

import { Component } from '../ecs/component.js'
import { CHARACTER_MODELS } from '../03-MMORPG/shared/data.mjs'
import { CharacterFSM } from './CharacterFSM.js'
import { AnimationProxy } from './AnimationProxy.js'

class BasicCharacterController extends Component {
  constructor({ desc }) {
    super()
    this.params = { desc }
  }

  InitEntity() {
    this.Init_()
  }

  Init_() {
    this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -5.0)
    this.acceleration_ = new THREE.Vector3(1, 0.125, 100.0)
    this.velocity_ = new THREE.Vector3(0, 0, 0)
    this.group_ = new THREE.Group()

    scene.add(this.group_)

    this.animations = {}

    this.LoadModels_()
  }

  InitComponent() {
    this._RegisterHandler('health.death', m => {
      this.OnDeath_(m)
    })
    this._RegisterHandler(
      'update.position', m => {
        this.OnUpdatePosition_(m)
      })
    this._RegisterHandler(
      'update.rotation', m => {
        this.OnUpdateRotation_(m)
      })
  }

  OnUpdatePosition_(msg) {
    this.group_.position.copy(msg.value)
  }

  OnUpdateRotation_(msg) {
    this.group_.quaternion.copy(msg.value)
  }

  OnDeath_(msg) {
    this.stateMachine_.SetState('death')
  }

  LoadModels_() {
    const classType = this.params.desc.character.class
    const modelData = CHARACTER_MODELS[classType]

    const loader = this.FindEntity('loader').GetComponent('LoadController')
    loader.LoadSkinnedGLB(modelData.path, modelData.base, glb => {
      this.target_ = glb.scene
      this.target_.scale.setScalar(modelData.scale)
      this.target_.visible = false

      this.group_.add(this.target_)

      this.bones_ = {}
      this.target_.traverse(c => {
        if (!c.skeleton)
          return

        for (const b of c.skeleton.bones)
          this.bones_[b.name] = b

      })

      this.target_.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
        if (c.material && c.material.map)
          c.material.map.encoding = THREE.sRGBEncoding

      })

      this._mixer = new THREE.AnimationMixer(this.target_)

      const _FindAnim = animName => {
        for (let i = 0; i < glb.animations.length; i++)
          if (glb.animations[i].name.includes(animName)) {
            const clip = glb.animations[i]
            const action = this._mixer.clipAction(clip)
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

      this.target_.visible = true

      this.stateMachine_ = new CharacterFSM(new AnimationProxy(this.animations))

      this.stateMachine_.SetState('idle')

      this.Broadcast({
        topic: 'load.character',
        model: this.target_,
        bones: this.bones_,
      })

      this.FindEntity('ui').GetComponent('UIController').FadeoutLogin()
    })
  }

  _FindIntersections(pos, oldPos) {
    const _IsAlive = c => {
      const h = c.entity.GetComponent('HealthComponent')
      if (!h)
        return true

      return h.Health > 0
    }

    const grid = this.GetComponent('SpatialGridController')
    const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e))
    const collisions = []

    for (let i = 0; i < nearby.length; ++i) {
      const e = nearby[i].entity
      const d = ((pos.x - e.Position.x) ** 2 + (pos.z - e.Position.z) ** 2) ** 0.5

      // HARDCODED
      if (d <= 4) {
        const d2 = ((oldPos.x - e.Position.x) ** 2 + (oldPos.z - e.Position.z) ** 2) ** 0.5

        // If they're already colliding, let them get untangled.
        if (d2 <= 4)
          continue
        else
          collisions.push(nearby[i].entity)

      }
    }
    return collisions
  }

  Update(timeInSeconds) {
    if (!this.stateMachine_)
      return

    const input = { _keys: keyboard }
    this.stateMachine_.Update(timeInSeconds, input)

    if (this._mixer)
      this._mixer.update(timeInSeconds)

    // HARDCODED
    this.Broadcast({
      topic: 'player.action',
      action: this.stateMachine_._currentState.Name,
    })

    const currentState = this.stateMachine_._currentState
    if (currentState.Name != 'walk' &&
      currentState.Name != 'run' &&
      currentState.Name != 'idle')
      return

    const velocity = this.velocity_
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this.decceleration_.x,
      velocity.y * this.decceleration_.y,
      velocity.z * this.decceleration_.z
    )
    frameDecceleration.multiplyScalar(timeInSeconds)
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const controlObject = this.group_
    const _Q = new THREE.Quaternion()
    const _A = new THREE.Vector3()
    const _R = controlObject.quaternion.clone()

    const acc = this.acceleration_.clone()
    if (input._keys.capsLock)
      acc.multiplyScalar(2.0)

    if (input._keys.up)
      velocity.z += acc.z * timeInSeconds

    if (input._keys.down)
      velocity.z -= acc.z * timeInSeconds

    if (input._keys.left) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this.acceleration_.y)
      _R.multiply(_Q)
    }
    if (input._keys.right) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this.acceleration_.y)
      _R.multiply(_Q)
    }

    controlObject.quaternion.copy(_R)

    const oldPosition = new THREE.Vector3()
    oldPosition.copy(controlObject.position)

    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(controlObject.quaternion)
    forward.normalize()

    const sideways = new THREE.Vector3(1, 0, 0)
    sideways.applyQuaternion(controlObject.quaternion)
    sideways.normalize()

    sideways.multiplyScalar(velocity.x * timeInSeconds)
    forward.multiplyScalar(velocity.z * timeInSeconds)

    const pos = controlObject.position.clone()
    pos.add(forward)
    pos.add(sideways)

    const collisions = this._FindIntersections(pos, oldPosition)
    if (collisions.length > 0)
      return

    const terrain = this.FindEntity('terrain').GetComponent('TerrainChunkManager')
    pos.y = terrain.GetHeight(pos)[0]

    controlObject.position.copy(pos)

    this.Parent.SetPosition(controlObject.position)
    this.Parent.SetQuaternion(controlObject.quaternion)
  }
};

export {
  CharacterFSM,
  BasicCharacterController,
}
