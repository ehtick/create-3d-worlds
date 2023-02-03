import * as THREE from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getSize, mapRange } from '/utils/helpers.js'
import { states, jumpStyles, chooseJumpState } from './states/index.js'

export default class Player {
  constructor({
    mesh, animations, dict, camera, keyboard = defaultKeyboard, useJoystick,
    speed = 2, jumpStyle = jumpStyles.FLY_JUMP, maxVelocityY = speed / 30, solids
  }) {
    this.mesh = mesh
    this.speed = speed
    this.solids = []
    this.groundY = 0
    this.velocityY = 0
    this.maxVelocityY = maxVelocityY
    this.minVelocityY = -this.maxVelocityY

    this.jumpStyle = jumpStyle
    this.keyboard = keyboard

    if (useJoystick) this.joystick = new JoyStick()

    this.actions = {}
    if (animations?.length && dict)
      this.setupMixer(animations, dict)

    if (camera) {
      this.thirdPersonCamera = new ThirdPersonCamera({ camera, mesh })
      this.controls = createOrbitControls()
    }

    if (solids) this.addSolids(solids)
    this.setState('idle')
  }

  /* GETTERS */

  get size() { // TODO: deprecate
    return this.height
  }

  get width() {
    return getSize(this.mesh, 'x')
  }

  get height() {
    return getSize(this.mesh, 'y')
  }

  get depth() {
    return getSize(this.mesh, 'z')
  }

  get position() {
    return this.mesh.position
  }

  get action() {
    return this.currentState.action
  }

  get inAir() {
    return this.mesh.position.y - this.groundY > this.height * .2
  }

  /* ANIMATIONS */

  setupMixer(animations, dict) {
    this.mixer = new THREE.AnimationMixer(this.mesh)
    for (const key in dict) {
      const clip = animations.find(anim => anim.name == dict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
  }

  /* STATE MACHINE */

  getState(name) {
    if (name === 'jump') return chooseJumpState (this.jumpStyle)
    return states[name] || states.special
  }

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = this.getState(name)
    this.currentState = new State(this, name)
    this.currentState.enter(oldState, oldState?.action)
  }

  /* OTHER */

  add(obj) {
    this.mesh.add(obj)
  }

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  normalizeGround(jumpStep) {
    const difference = () => this.mesh.position.y - this.groundY // need current value, not cached
    if (!difference()) return
    if (difference() < 0) this.mesh.translateY(jumpStep)
    if (difference() > 0 && difference() <= jumpStep) this.mesh.position.y = this.groundY
  }

  randomizeAction() { // start at random time
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* UPDATES */

  updateGround() {
    const { mesh, solids } = this
    this.groundY = raycastGround({ mesh, solids }, { y: this.height })
  }

  updateCamera(delta) {
    if (!this.thirdPersonCamera) return

    if (this.keyboard.pressed.mouse)
      this.controls.target = this.mesh.position.clone().add(new THREE.Vector3(0, this.height, 0))
    else {
      this.thirdPersonCamera.updateCurrentPosition()
      this.thirdPersonCamera.update(delta)
    }
  }

  update(delta = 1 / 60) {
    this.updateGround()
    this.updateCamera(delta)
    this.currentState.update(delta)
    this.mixer?.update(delta)
  }
}
