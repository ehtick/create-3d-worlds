import * as THREE from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getSize } from '/utils/helpers.js'
import { jumpStyles, getState } from './states/index.js'

export default class Player {
  constructor({
    mesh, animations, dict, camera, keyboard = defaultKeyboard, solids, useJoystick, speed = 2, gravity = .7,
    jumpStyle = jumpStyles.FLY, jumpForce = gravity * 2, maxJumpTime = 17, fallLimit = gravity * 20
  }) {
    this.mesh = mesh
    this.speed = speed
    this.solids = []
    this.gravity = gravity
    this.groundY = 0
    this.velocityY = 0
    this.fallLimit = fallLimit
    this.jumpStyle = jumpStyle
    this.maxJumpTime = maxJumpTime
    this.jumpForce = jumpForce

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

  get height() {
    return getSize(this.mesh, 'y')
  }

  /*
  get width() {
    return getSize(this.mesh, 'x')
  }

  get depth() {
    return getSize(this.mesh, 'z')
  }
  */

  get position() {
    return this.mesh.position
  }

  get inAir() {
    return this.mesh.position.y - this.groundY > this.height * .2
  }

  get action() {
    return this.currentState.action
  }

  /* ANIMATION ACTIONS */

  setupMixer(animations, dict) {
    this.mixer = new THREE.AnimationMixer(this.mesh)
    for (const key in dict) {
      const clip = animations.find(anim => anim.name == dict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
  }

  /* STATE MACHINE */

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = getState(name, this.jumpStyle)
    this.currentState = new State(this, name)
    this.currentState.enter(oldState, oldState?.action)
  }

  /* UTILS */

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

  applyGravity(delta) {
    if (this.velocityY > -this.fallLimit * delta)
      this.velocityY -= this.gravity * delta
  }

  applyVelocity() {
    if (this.mesh.position.y + this.velocityY > this.groundY)
      this.mesh.translateY(this.velocityY)
    else
      this.mesh.position.y = this.groundY
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
