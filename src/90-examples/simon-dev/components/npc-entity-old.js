import * as THREE from '/node_modules/three127/build/three.module.js'
import { FBXLoader } from '/node_modules/three127/examples/jsm/loaders/FBXLoader.js'

import { FiniteStateMachine } from '../fsm/finite-state-machine.js'
import { Component } from '../ecs/component.js'
import { player_state } from '../fsm/player-state.js'

class NPCFSM extends FiniteStateMachine {
  constructor(animations) {
    super()
    this.animations = animations
    this.Init()
  }

  Init() {
    this.AddState('idle', player_state.IdleState)
    this.AddState('walk', player_state.WalkState)
    this.AddState('death', player_state.DeathState)
    this.AddState('attack', player_state.AttackState)
  }
};

export class NPCController extends Component {
  constructor(params) {
    super()
    this.Init(params)
  }

  Init(params) {
    this.params = params
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
    this._acceleration = new THREE.Vector3(1, 0.25, 40.0)
    this._velocity = new THREE.Vector3(0, 0, 0)
    this._position = new THREE.Vector3()
    this.animations = {}
    this.keys = {
      up: false,
      space: false,
    }
    this.stateMachine = new NPCFSM(this.animations)
    this._LoadModels()
  }

  InitComponent() {
    this.RegisterHandler('health.death', m => {
      this._OnDeath(m)
    })
    this.RegisterHandler('update.position', m => {
      this._OnPosition(m)
    })
  }

  _OnDeath(msg) {
    this.stateMachine.SetState('death')
  }

  _OnPosition(m) {
    if (this.target) {
      this.target.position.copy(m.value)
      this.target.position.y = 0.35
    }
  }

  _LoadModels() {
    const loader = new FBXLoader()
    loader.setPath('/assets/simon-dev/monsters/FBX/')
    loader.load(this.params.resourceName, glb => {
      this.target = glb
      this.params.scene.add(this.target)

      this.target.scale.setScalar(0.025)
      this.target.position.copy(this.parent._position)
      this.target.position.y += 0.35
      const texLoader = new THREE.TextureLoader()
      const texture = texLoader.load(
        '/assets/simon-dev/monsters/Textures/' + this.params.resourceTexture)
      texture.encoding = THREE.sRGBEncoding
      texture.flipY = true

      this.target.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
        if (c.material) {
          c.material.map = texture
          c.material.side = THREE.DoubleSide
        }
      })

      this.mixer = new THREE.AnimationMixer(this.target)

      const fbx = glb
      const _FindAnim = animName => {
        for (let i = 0; i < fbx.animations.length; i++)
          if (fbx.animations[i].name.includes(animName)) {
            const clip = fbx.animations[i]
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
      this.animations.death = _FindAnim('Death')
      this.animations.attack = _FindAnim('Bite_Front')
      this.stateMachine.SetState('idle')
    })
  }

  get Position() {
    return this._position
  }

  get Rotation() {
    if (!this.target) return new THREE.Quaternion()

    return this.target.quaternion
  }

  _FindIntersections(pos) {
    const _IsAlive = c => {
      const h = c.entity.GetComponent('HealthComponent')
      if (!h) return true
      return h._health > 0
    }

    const grid = this.GetComponent('SpatialGridController')
    const nearby = grid.FindNearbyEntities(2).filter(e => _IsAlive(e))
    const collisions = []

    for (let i = 0; i < nearby.length; ++i) {
      const e = nearby[i].entity
      const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5
      // HARDCODED
      if (d <= 4)
        collisions.push(nearby[i].entity)
    }
    return collisions
  }

  _FindPlayer(pos) {
    const _IsAlivePlayer = c => {
      const h = c.entity.GetComponent('HealthComponent')
      if (!h) return false

      if (c.entity.Name != 'player')
        return false

      return h._health > 0
    }

    const grid = this.GetComponent('SpatialGridController')
    const nearby = grid.FindNearbyEntities(100).filter(c => _IsAlivePlayer(c))

    if (nearby.length == 0)
      return new THREE.Vector3(0, 0, 0)

    const dir = this.parent._position.clone()
    dir.sub(nearby[0].entity._position)
    dir.y = 0.0
    dir.normalize()

    return dir
  }

  _UpdateAI(timeInSeconds) {
    const { currentState } = this.stateMachine
    if (currentState.Name != 'walk' && currentState.Name != 'run' && currentState.Name != 'idle')
      return

    if (currentState.Name == 'death') return

    if (currentState.Name == 'idle' || currentState.Name == 'walk')
      this._OnAIWalk(timeInSeconds)
  }

  _OnAIWalk(timeInSeconds) {
    const dirToPlayer = this._FindPlayer()

    const velocity = this._velocity
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    )
    frameDecceleration.multiplyScalar(timeInSeconds)
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const controlObject = this.target
    const _R = controlObject.quaternion.clone()

    this.keys.up = false

    const acc = this._acceleration
    if (dirToPlayer.length() == 0) return

    this.keys.up = true
    velocity.z += acc.z * timeInSeconds

    const m = new THREE.Matrix4()
    m.lookAt(new THREE.Vector3(0, 0, 0), dirToPlayer, new THREE.Vector3(0, 1, 0))
    _R.setFromRotationMatrix(m)

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

    const collisions = this._FindIntersections(pos)
    if (collisions.length > 0) {
      this.keys.space = true
      this.keys.up = false
      return
    }

    controlObject.position.copy(pos)
    this._position.copy(pos)

    this.parent.SetPosition(this._position)
    this.parent.SetQuaternion(this.target.quaternion)
  }

  Update(timeInSeconds) {
    if (!this.stateMachine.currentState) return

    this.keys.space = false
    this.keys.up = false

    this._UpdateAI(timeInSeconds)

    this.stateMachine.Update(timeInSeconds, this.keys)

    // HARDCODED
    if (this.stateMachine.currentState._action)
      this.Broadcast({
        topic: 'player.action',
        action: this.stateMachine.currentState.Name,
        time: this.stateMachine.currentState._action.time,
      })

    if (this.mixer) this.mixer.update(timeInSeconds)
  }
};
