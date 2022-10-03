import * as THREE from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { getHeight } from '/utils/helpers.js'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import SpecialState from './states/SpecialState.js'
import JumpState from './states/JumpState.js'
import JumpFlyState from './states/JumpFlyState.js'
import FlyState from './states/FlyState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  walkBackward: WalkBackwardState,
  run: RunState,
  jump: FlyState,
}

export default class PlayerFSM {
  constructor({ mesh, animations, dict, camera, keyboard = defaultKeyboard, useJoystick, speed = 2 }) {
    this.mesh = mesh
    this.keyboard = keyboard
    if (useJoystick) this.joystick = new JoyStick()
    this.actions = {}

    if (animations?.length)
      this.setupMixer(animations, dict)

    if (camera) {
      this.thirdPersonCamera = new ThirdPersonCamera({ camera, mesh })
      this.controls = createOrbitControls()
    }

    this.speed = speed
    this.setState('idle')
  }

  setupMixer(animations, dict) {
    this.mixer = new THREE.AnimationMixer(this.mesh.isGroup ? this.mesh.children[0] : this.mesh)
    for (const key in dict) {
      const clip = animations.find(anim => anim.name == dict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
    if (this.actions?.walk) this.actions.walkBackward = this.actions.walk
  }

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    let State = states[name] || SpecialState
    // if (name === 'jump' && !this.actions?.jump) State = JumpFlyState
    this.currentState = new State(this, name)
    this.currentState.enter(oldState, oldState?.action)
  }

  update(delta = 1 / 60) {
    this.currentState?.update(delta)
    this.mixer?.update(delta)

    if (this.thirdPersonCamera)
      if (this.keyboard.pressed.mouse) {
        const height = getHeight(this.mesh)
        this.controls.target = this.mesh.position.clone().add(new THREE.Vector3(0, height, 0))
      } else {
        this.thirdPersonCamera.updateCurrentPosition()
        this.thirdPersonCamera.update(delta)
      }
  }

  get action() {
    return this.currentState.action
  }

  randomizeAction() {
    this.action.time = Math.random() * this.action.getClip().duration
  }
}
