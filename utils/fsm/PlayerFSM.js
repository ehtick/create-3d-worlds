import * as THREE from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getHeight, directionBlocked } from '/utils/helpers.js'

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
  jump: JumpFlyState,
}

const minVelocityY = -.1

export default class PlayerFSM {
  constructor({ mesh, animations, dict, camera, keyboard = defaultKeyboard, useJoystick, speed = 2 }) {
    this.mesh = mesh
    this.speed = speed
    this.size = getHeight(mesh)
    this.solids = []
    this.groundY = 0
    this.gravity = .9
    this.velocityY = 0

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
    if (this.actions?.walk) this.actions.walkBackward = this.actions.walk
  }

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = states[name] || SpecialState
    this.currentState = new State(this, name)
    this.currentState.enter(oldState, oldState?.action)
  }

  updateGravity(delta) {
    this.updateGround()
    const gravityStep = this.gravity * delta

    if (this.velocityY - gravityStep >= minVelocityY)
      this.velocityY -= gravityStep

    this.mesh.translateY(this.velocityY)

    if (!this.inAir)
      this.mesh.position.y = this.groundY
  }

  update(delta = 1 / 60) {
    this.updateGravity(delta)

    this.currentState?.update(delta)
    this.mixer?.update(delta)

    if (this.thirdPersonCamera)
      if (this.keyboard.pressed.mouse)
        this.controls.target = this.mesh.position.clone().add(new THREE.Vector3(0, this.size, 0))
      else {
        this.thirdPersonCamera.updateCurrentPosition()
        this.thirdPersonCamera.update(delta)
      }
  }

  get action() {
    return this.currentState.action
  }

  get inAir() {
    return this.mesh.position.y > this.groundY
  }

  randomizeAction() { // start at random time
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* RAYCAST */

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  directionBlocked(vector) {
    return directionBlocked(this.mesh, this.solids, vector)
  }

  updateGround() {
    const { mesh, solids } = this
    this.groundY = raycastGround({ mesh, solids }, { y: this.size * 2 })
  }
}
