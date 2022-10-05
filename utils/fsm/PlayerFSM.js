import * as THREE from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getHeight } from '/utils/helpers.js'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import SpecialState from './states/SpecialState.js'
import JumpState from './states/JumpState.js'
import JumpFlyState from './states/JumpFlyState.js'
import FlyState from './states/FlyState.js'
import FallState from './states/FallState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  jump: FlyState,
  fall: FallState,
}

const jumpStyles = {
  FLY: 'FLY',
  JUMP: 'JUMP',
  FLY_JUMP: 'FLY_JUMP',
}

export default class PlayerFSM {
  constructor({
    mesh, animations, dict, camera, keyboard = defaultKeyboard, useJoystick,
    speed = 2, jumpStyle = jumpStyles.FLY_JUMP
  }) {
    this.mesh = mesh
    this.speed = speed
    this.size = getHeight(mesh)
    this.solids = []
    this.groundY = 0
    this.velocityY = 0
    this.jumpStyle = jumpStyle
    this.keyboard = keyboard

    if (useJoystick) this.joystick = new JoyStick()

    this.actions = {}
    if (animations?.length)
      this.setupMixer(animations, dict)

    if (camera) {
      this.thirdPersonCamera = new ThirdPersonCamera({ camera, mesh })
      this.controls = createOrbitControls()
    }

    this.setState('idle')
  }

  setupMixer(animations, dict) {
    this.mixer = new THREE.AnimationMixer(this.mesh.isGroup ? this.mesh.children[0] : this.mesh)
    for (const key in dict) {
      const clip = animations.find(anim => anim.name == dict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
  }

  /* STATE MACHINE */

  mapState(name) {
    if (name === 'jump')
      switch (this.jumpStyle) {
        case jumpStyles.FLY: return FlyState
        case jumpStyles.JUMP: return JumpState
        case jumpStyles.FLY_JUMP: return JumpFlyState
      }
    return states[name] || SpecialState
  }

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = this.mapState(name)
    this.currentState = new State(this, name)
    this.currentState.enter(oldState, oldState?.action)
  }

  update(delta = 1 / 60) {
    this.updateGround()
    this.updateCamera(delta)

    this.currentState.update(delta)
    this.mixer?.update(delta)
  }

  /* GETTERS */

  get action() {
    return this.currentState.action
  }

  get inAir() {
    return this.mesh.position.y > this.groundY
  }

  /* OTHER */

  randomizeAction() { // start at random time
    this.action.time = Math.random() * this.action.getClip().duration
  }

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  updateGround() {
    const { mesh, solids } = this
    this.groundY = raycastGround({ mesh, solids }, { y: this.size })
  }

  updateCamera(delta) {
    if (this.thirdPersonCamera)
      if (this.keyboard.pressed.mouse)
        this.controls.target = this.mesh.position.clone().add(new THREE.Vector3(0, this.size, 0))
      else {
        this.thirdPersonCamera.updateCurrentPosition()
        this.thirdPersonCamera.update(delta)
      }
  }
}
