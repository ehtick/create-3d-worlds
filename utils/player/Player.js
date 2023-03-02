import { Vector3, AnimationMixer, Box3 } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { createOrbitControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Input.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getSize, directionBlocked, getMesh } from '/utils/helpers.js'
import { dir, RIGHT_ANGLE, jumpStyles } from '/utils/constants.js'
import { getPlayerState } from './states/index.js'
import { createPlayerBox } from '/utils/geometry.js'

const pos = new Vector3()

/**
 * param animDict: maps state to animation
 * keys: idle, walk, run, jump, fall, attack, attack2, special, pain, wounded, death
 */
export default class Player {
  constructor({
    mesh = createPlayerBox(), animations, animDict, camera, input = defaultKeyboard, solids, useJoystick, gravity = .7, jumpStyle = jumpStyles.FALSE_JUMP, attackStyle, speed = 2, jumpForce = gravity * 2, maxJumpTime = 17, fallLimit = gravity * 20, drag = 0.5, getState = name => getPlayerState(name, jumpStyle, attackStyle), shouldRaycastGround = true, rifle, pistol, cameraConfig = {}, mapSize, coords
  }) {
    this.mesh = clone(mesh)
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
    this.input = input
    this.getState = getState
    this.shouldRaycastGround = shouldRaycastGround
    this.energy = 100
    this.actions = {}

    if (solids) this.addSolids(solids)

    if (useJoystick) this.input.joystick = new JoyStick()

    if (animations?.length && animDict) {
      this.setupMixer(animations, animDict)
      if (rifle) this.addRifle(clone(rifle))
      if (pistol) this.addPistol(clone(pistol))
    }

    if (coords) this.position.copy(coords.pop())

    if (camera) {
      camera.position.copy(this.position)
      this.thirdPersonCamera = new ThirdPersonCamera({ camera, mesh: this.mesh, ...cameraConfig })
      this.controls = createOrbitControls()
      this.controls.target = this.position
    }

    if (mapSize) {
      const halfMap = mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
    }

    this.setState('idle')
  }

  /* GETTERS */

  get height() {
    return getSize(this.mesh, 'y')
  }

  get position() {
    return this.mesh.position
  }

  get name() {
    return this.mesh.name
  }

  set name(name) {
    this.mesh.name = name
  }

  get heightDifference() {
    return this.mesh.position.y - this.groundY
  }

  get inAir() {
    if (!this.shouldRaycastGround) return false

    return this.heightDifference > .001
  }

  get action() {
    return this.currentState.action
  }

  get acceleration() {
    const { input, speed } = this
    if (input.amountForward) return speed * -input.amountForward * (input.up ? 2 : 1.5)

    if (input.up) return speed * (input.run ? 2 : 1)
    if (input.down) return -speed * (input.run ? 1.5 : 1)

    return 0
  }

  get outOfBounds() {
    if (!this.boundaries) return false
    return this.position.x >= this.boundaries.max.x
      || this.position.x <= this.boundaries.min.x
      || this.position.z >= this.boundaries.max.z
      || this.position.z <= this.boundaries.min.z
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

  createRun(walk) {
    return this.mixer.clipAction(walk.clone()).setEffectiveTimeScale(1.5)
  }

  setupMixer(animations, animDict) {
    this.mixer = new AnimationMixer(getMesh(this.mesh))
    for (const key in animDict) {
      const clip = animations.find(anim => anim.name == animDict[key])
      this.actions[key] = this.mixer.clipAction(clip)
    }
    if (!animDict.run && animDict.walk) {
      const clip = animations.find(anim => anim.name == animDict.walk)
      this.actions.run = this.createRun(clip)
    }
  }

  findHands() {
    this.rightHand = null
    this.leftHand = null
    this.mesh.traverse(child => {
      if (child.name === 'mixamorigRightHand') this.rightHand = child
      if (child.name === 'mixamorigLeftHandMiddle1') this.leftHand = child
    })
  }

  /* UTILS */

  add(obj) {
    this.mesh.add(obj)
  }

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  addRifle(mesh) {
    if (!this.rightHand || !this.leftHand) this.findHands()
    this.rightHand.add(mesh)
    this.rifle = mesh
  }

  addPistol(mesh) {
    if (!this.rightHand) this.findHands()
    this.rightHand.add(mesh)
  }

  handleRoughTerrain(step) {
    if (!this.heightDifference) return

    if (this.heightDifference < 0)
      this.mesh.translateY(step)

    if (this.heightDifference > 0 && this.heightDifference <= step)
      this.mesh.position.y = this.groundY
  }

  directionBlocked(dir, solids = this.solids) {
    return directionBlocked(this.mesh, solids, dir)
  }

  turn(angle) {
    this.mesh.rotateOnAxis(new Vector3(0, 1, 0), angle)
  }

  bounce(angle = Math.PI) {
    this.turn(angle)
    this.mesh.translateZ(this.velocity.z)
  }

  /* UPDATES */

  updateWeapon() {
    this.leftHand.getWorldPosition(pos)
    this.rifle.lookAt(pos)
  }

  checkHit() {
    const { userData } = this.mesh
    if (!userData.hitAmount) return

    this.energy -= userData.hitAmount
    userData.hitAmount = 0

    if (this.energy <= 0)
      this.setState('death')
    else
      this.setState('pain')
  }

  updateMove(delta, reaction) {
    const direction = this.input.up ? dir.forward : dir.backward
    if (this.directionBlocked(direction))
      switch (reaction) {
        case 'BOUNCE':
          this.bounce()
          break
        case 'TRANSLATE':
          this.mesh.translateX(delta * 2.5)
          this.mesh.translateZ(delta * 2.5)
          break
        default: return // stuck
      }

    this.handleRoughTerrain(Math.abs(this.acceleration) * delta)

    const jumpDir = this.input.up ? dir.upForward : dir.upBackward
    if (this.input.space && this.directionBlocked(jumpDir)) return

    this.velocity.z += -this.acceleration * delta
    this.velocity.z *= (1 - this.drag)
    this.mesh.translateZ(this.velocity.z)
  }

  updateTurn(delta) {
    if (!delta) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second

    if (this.input.left)
      this.turn(angle)
    if (this.input.right)
      this.turn(angle * -1)
  }

  updateStrafe(delta) {
    if (this.input.sideLeft && !this.directionBlocked(dir.left))
      this.mesh.translateX(-this.speed * delta)

    if (this.input.sideRight && !this.directionBlocked(dir.right))
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
    if (!this.input.pressed.mouse2)
      this.thirdPersonCamera.update(delta)
  }

  update(delta = 1 / 60) {
    this.updateGround()
    this.currentState.update(delta)
    this.mixer?.update(delta)
    if (this.rifle) this.updateWeapon()
    this.checkHit()
    if (this.outOfBounds) this.bounce()
    if (this.thirdPersonCamera) this.updateCamera(delta)
  }
}
