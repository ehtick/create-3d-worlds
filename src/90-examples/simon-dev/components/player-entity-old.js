import * as THREE from '/node_modules/three127/build/three.module.js'
import { FBXLoader } from '/node_modules/three127/examples/jsm/loaders/FBXLoader.js'
import keyboard from '/classes/Keyboard.js'

import { Component } from '../ecs/component.js'
import { CharacterFSM } from './CharacterFSM.js'
import { AnimationProxy } from './AnimationProxy.js'

export class BasicCharacterController extends Component {
  constructor(params) {
    super()
    this._Init(params)
  }

  _Init(params) {
    this.params = params
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
    this._acceleration = new THREE.Vector3(1, 0.125, 50.0)
    this._velocity = new THREE.Vector3(0, 0, 0)
    this._position = new THREE.Vector3()

    this.animations = {}
    this.stateMachine = new CharacterFSM(new AnimationProxy(this.animations))

    this._LoadModels()
  }

  InitComponent() {
    this._RegisterHandler('health.death', m => {
      this._OnDeath(m)
    })
  }

  _OnDeath(msg) {
    this.stateMachine.SetState('death')
  }

  _LoadModels() {
    const loader = new FBXLoader()
    loader.setPath('/assets/simon-dev/guard/')
    loader.load('castle_guard_01.fbx', fbx => {
      this.target = fbx
      this.target.scale.setScalar(0.035)
      this.params.scene.add(this.target)

      this._bones = {}

      for (const b of this.target.children[1].skeleton.bones)
        this._bones[b.name] = b

      this.target.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
        if (c.material && c.material.map)
          c.material.map.encoding = THREE.sRGBEncoding

      })

      this.Broadcast({
        topic: 'load.character',
        model: this.target,
        bones: this._bones,
      })

      this.mixer = new THREE.AnimationMixer(this.target)

      const _OnLoad = (animName, anim) => {
        const clip = anim.animations[0]
        const action = this.mixer.clipAction(clip)

        this.animations[animName] = {
          clip,
          action,
        }
      }

      this._manager = new THREE.LoadingManager()
      this._manager.onLoad = () => {
        this.stateMachine.SetState('idle')
      }

      const loader = new FBXLoader(this._manager)
      loader.setPath('/assets/simon-dev/guard/')
      loader.load('Sword And Shield Idle.fbx', a => {
        _OnLoad('idle', a)
      })
      loader.load('Sword And Shield Run.fbx', a => {
        _OnLoad('run', a)
      })
      loader.load('Sword And Shield Walk.fbx', a => {
        _OnLoad('walk', a)
      })
      loader.load('Sword And Shield Slash.fbx', a => {
        _OnLoad('attack', a)
      })
      loader.load('Sword And Shield Death.fbx', a => {
        _OnLoad('death', a)
      })
    })
  }

  _FindIntersections(pos) {
    const _IsAlive = c => {
      const h = c.entity.GetComponent('HealthComponent')
      if (!h)
        return true

      return h._health > 0
    }

    const grid = this.GetComponent('SpatialGridController')
    const nearby = grid.FindNearbyEntities(5).filter(e => _IsAlive(e))
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

  Update(timeInSeconds) {
    if (!this.stateMachine.currentState)
      return

    const input = { keys: keyboard }
    this.stateMachine.Update(timeInSeconds, input)

    if (this.mixer)
      this.mixer.update(timeInSeconds)

    // HARDCODED
    if (this.stateMachine.currentState._action)
      this.Broadcast({
        topic: 'player.action',
        action: this.stateMachine.currentState.Name,
        time: this.stateMachine.currentState._action.time,
      })

    const currentState = this.stateMachine.currentState
    if (currentState.Name != 'walk' && currentState.Name != 'run' && currentState.Name != 'idle')
      return

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
    const _Q = new THREE.Quaternion()
    const _A = new THREE.Vector3()
    const _R = controlObject.quaternion.clone()

    const acc = this._acceleration.clone()
    if (input.keys.capsLock)
      acc.multiplyScalar(2.0)

    if (input.keys.up)
      velocity.z += acc.z * timeInSeconds

    if (input.keys.down)
      velocity.z -= acc.z * timeInSeconds

    if (input.keys.left) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y)
      _R.multiply(_Q)
    }
    if (input.keys.right) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y)
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

    const collisions = this._FindIntersections(pos)
    if (collisions.length > 0)
      return

    controlObject.position.copy(pos)
    this._position.copy(pos)

    this.parent.SetPosition(this._position)
    this.parent.SetQuaternion(this.target.quaternion)
  }
};
