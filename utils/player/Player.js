import { Vector3, AnimationMixer } from 'three'

import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Keyboard.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getSize, directionBlocked, getMesh } from '/utils/helpers.js'
import { dir, RIGHT_ANGLE, jumpStyles } from '/utils/constants.js'
import { getPlayerState } from './states/index.js'

export default class Player {
  constructor({
    mesh, animations, animDict, camera, keyboard = defaultKeyboard, solids, useJoystick, gravity = .7,
    jumpStyle = jumpStyles.JUMP, speed = 2, jumpForce = gravity * 2, maxJumpTime = 17, fallLimit = gravity * 20, drag = 0.5, getState = name => getPlayerState(name, jumpStyle), shouldRaycastGround = true
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
    this.getState = getState
    this.shouldRaycastGround = shouldRaycastGround

    if (useJoystick) this.joystick = new JoyStick()

    this.actions = {}
    if (animations?.length && animDict)
      this.setupMixer(animations, animDict)

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
    if (keyboard.run && this.controlsUp) return speed * 2
    if (keyboard.run && this.controlsDown) return -speed * 1.5
    if (this.controlsUp) return speed
    if (this.controlsDown) return -speed
    return 0
  }

  /* CONTROLS */

  get controlsUp() {
    return this.keyboard.up || this.joystick?.forward < 0
  }

  get controlsDown() {
    return this.keyboard.down || this.joystick?.forward > 0
  }

  get controlsRun() {
    return this.keyboard.run || Math.abs(this.joystick?.forward) > .75
  }

  /* STATE MACHINE */

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

  /* ANIMATIONS */

  setupMixer(animations, animDict) {
    this.mixer = new AnimationMixer(getMesh(this.mesh))
    for (const key in animDict) {
      const clip = animations.find(anim => anim.name == animDict[key])
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

  directionBlocked(vector) {
    return directionBlocked(this.mesh, this.solids, vector)
  }

  turn(angle) {
    this.mesh.rotateOnAxis(new Vector3(0, 1, 0), angle)
  }

  /* UPDATES */

  updateMove(delta) {
    const direction = this.controlsUp ? dir.forward : dir.backward
    if (this.directionBlocked(direction)) return

    const jumpDir = this.controlsUp ? dir.upForward : dir.upBackward
    if (this.keyboard.space && this.directionBlocked(jumpDir)) return

    this.velocity.z += this.acceleration * delta * (this.joystick?.forward || -1)
    this.velocity.z *= (1 - this.drag)
    this.mesh.translateZ(this.velocity.z)
  }

  updateTurn(delta) {
    if (!delta) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.joystick)
      this.turn(angle * -this.joystick.turn)

    if (this.keyboard.left)
      this.turn(angle)
    if (this.keyboard.right)
      this.turn(angle * -1)
  }

  updateStrafe(delta) {
    if (this.keyboard.sideLeft && !this.directionBlocked(dir.left))
      this.mesh.translateX(-this.speed * delta)

    if (this.keyboard.sideRight && !this.directionBlocked(dir.right))
      this.mesh.translateX(this.speed * delta)
  }

  updateGround() {
    if (!this.shouldRaycastGround) return
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
    if (this.keyboard.pressed.mouse)
      this.controls.target = this.mesh.position.clone().add(new Vector3(0, this.height, 0))
    else {
      this.thirdPersonCamera.updateCurrentPosition()
      this.thirdPersonCamera.update(delta)
    }
  }

  update(delta = 1 / 60) {
    this.updateGround()
    if (this.thirdPersonCamera) this.updateCamera(delta)
    this.currentState.update(delta)
    this.mixer?.update(delta)
  }
}
