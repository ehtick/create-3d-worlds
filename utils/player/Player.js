import { Vector3, AnimationMixer } from 'three'
import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getSize, directionBlocked } from '/utils/helpers.js'
import { jumpStyles, getState } from './states/index.js'
import { dir, RIGHT_ANGLE } from '/data/constants.js'

export default class Player {
  constructor({
    mesh, animations, dict, camera, keyboard = defaultKeyboard, solids, useJoystick, gravity = .7,
    jumpStyle = jumpStyles.FLY_JUMP, speed = 2, jumpForce = gravity * 2, maxJumpTime = 17, fallLimit = gravity * 20, drag = 0.5
  }) {
    this.mesh = mesh
    this.speed = speed
    this.solids = []
    this.groundY = 0
    this.gravity = gravity
    this.velocity = new Vector3()
    this.fallLimit = fallLimit
    this.jumpStyle = jumpStyle
    this.maxJumpTime = maxJumpTime
    this.jumpForce = jumpForce
    this.drag = drag
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

  get position() {
    return this.mesh.position
  }

  get heightDifference() {
    return this.mesh.position.y - this.groundY
  }

  get inAir() {
    return this.heightDifference > this.height * .2
  }

  get action() {
    return this.currentState.action
  }

  get acceleration() {
    const { keyboard, speed } = this
    if (keyboard.run && keyboard.up) return speed * 2
    if (keyboard.run && keyboard.down) return -speed * 1.5
    if (keyboard.up) return speed
    if (keyboard.down) return -speed
    return 0
  }

  get controlsDown() {
    return this.keyboard.down || this.joystick?.forward > 0
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

  /* ANIMATIONS */

  setupMixer(animations, dict) {
    this.mixer = new AnimationMixer(this.mesh)
    for (const key in dict) {
      const clip = animations.find(anim => anim.name == dict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
  }

  /* UTILS */

  add(obj) {
    this.mesh.add(obj)
  }

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  handleRoughTerrain(step) {
    if (!this.heightDifference) return

    if (this.heightDifference < 0)
      this.mesh.translateY(step)

    if (this.heightDifference > 0 && this.heightDifference <= step)
      this.mesh.position.y = this.groundY
  }

  randomizeAction() { // start at random time
    this.action.time = Math.random() * this.action.getClip().duration
  }

  directionBlocked(vector) {
    return directionBlocked(this.mesh, this.solids, vector)
  }

  /* UPDATES */

  move(delta) {
    const direction = this.keyboard.up ? dir.forward : dir.backward
    if (this.directionBlocked(direction)) return

    const jumpDir = this.keyboard.up ? dir.upForward : dir.upBackward
    if (this.keyboard.space && this.directionBlocked(jumpDir)) return

    this.velocity.z += this.acceleration * delta * (this.joystick?.forward || -1)
    this.velocity.z *= (1 - this.drag)
    this.mesh.translateZ(this.velocity.z)
  }

  turn(delta) {
    if (!delta) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.joystick)
      this.mesh.rotateOnAxis(new Vector3(0, 1, 0), angle * -this.joystick.turn)

    if (this.keyboard.left)
      this.mesh.rotateOnAxis(new Vector3(0, 1, 0), angle)
    if (this.keyboard.right)
      this.mesh.rotateOnAxis(new Vector3(0, 1, 0), angle * -1)
  }

  strafe(delta) {
    if (this.keyboard.sideLeft && !this.directionBlocked(dir.left))
      this.mesh.translateX(-this.speed * delta)

    if (this.keyboard.sideRight && !this.directionBlocked(dir.right))
      this.mesh.translateX(this.speed * delta)
  }

  updateGround() {
    const { mesh, solids } = this
    this.groundY = raycastGround({ mesh, solids }, { y: this.height })
  }

  applyGravity(delta) {
    if (this.velocity.y > -this.fallLimit * delta)
      this.velocity.y -= this.gravity * delta
  }

  applyVelocityY() {
    if (this.mesh.position.y + this.velocity.y > this.groundY)
      this.mesh.translateY(this.velocity.y)
    else
      this.mesh.position.y = this.groundY
  }

  updateCamera(delta) {
    if (!this.thirdPersonCamera) return

    if (this.keyboard.pressed.mouse)
      this.controls.target = this.mesh.position.clone().add(new Vector3(0, this.height, 0))
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
