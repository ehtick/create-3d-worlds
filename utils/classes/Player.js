import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'
import { createBox } from '/utils/geometry.js'
import { addSolids, raycastGround } from '/utils/classes/actions.js'
import { getHeight, directionBlocked } from '/utils/helpers.js'
import { dir } from '/data/constants.js'

const { pressed } = keyboard
const { LoopOnce, LoopRepeat, AnimationMixer } = THREE

/**
 * Handles user input, move mesh and animate model.
 * (loadModel handles size and rotation)
 */
export default class Player {
  constructor({ mesh = createBox({ size: 2 }), speed, camera, scene, animations, animNames = {} } = {}) {
    this.mesh = mesh
    this.size = getHeight(mesh)
    this.speed = speed || this.size * 2
    this.solids = []
    this.groundY = 0
    // some animation not work in group
    this.mixer = new AnimationMixer(mesh.type === 'Group' ? mesh.children[0] : mesh)
    this.animNames = animNames
    this.animations = animations
    if (camera) {
      this.add(camera)
      camera.position.set(0, 1, 1.5)
    }
    if (scene) scene.add(this.mesh)
  }

  inAir(step = this.size * .2) {
    return this.position.y - this.groundY > step
  }

  normalizeGround(jumpStep) {
    const difference = () => this.position.y - this.groundY // need current value, not cached
    if (!difference()) return
    if (difference() < 0) this.mesh.translateY(jumpStep)
    if (difference() > 0 && difference() < jumpStep) this.position.y = this.groundY
  }

  /* INPUT */

  handleInput(delta) {
    this.running = keyboard.capsLock
    const speed = this.running ? this.speed * 2 : this.speed
    this.step = speed * delta // speed in pixels per second
    this.jumpStep = speed * delta * 1.5
    this.turnAngle = Math.PI / 2 * delta

    this.normalizeGround(this.jumpStep)

    if (this.inAir(this.jumpStep) && !pressed.Space)
      this.fall()

    if (!keyboard.keyPressed)
      this.idle()

    if (pressed.Space) {
      if (keyboard.up && this.directionBlocked(dir.upForward)) {
        if (!this.directionBlocked(dir.up)) this.jump()
        this.fall()
      }

      if (keyboard.down && this.directionBlocked(dir.upBackward))
        this.fall()

      if (this.directionBlocked(dir.up))
        this.fall()

      if (keyboard.up) this.move()
      if (keyboard.down) this.move(1)
      if (keyboard.left) this.turn(1)
      if (keyboard.right) this.turn()
      this.jump()
    }

    if (keyboard.left) this.turn(1)
    if (keyboard.right) this.turn()

    if (pressed.mouse) this.attack()
    if (pressed.mouse2) this.special()

    if (keyboard.up)
      if (!this.directionBlocked(dir.forward)) this.move()

    if (keyboard.down)
      if (!this.directionBlocked(dir.backward)) this.move(1)

    if (pressed.KeyQ)
      if (!this.directionBlocked(dir.left)) this.sideWalk()

    if (pressed.KeyE)
      if (!this.directionBlocked(dir.right)) this.sideWalk(1)
  }

  /* MOVEMENTS */

  idle() {
    this.playAnimation(this.animNames.idle, LoopRepeat)
  }

  move(dir = -1) {
    this.mesh.translateZ(this.step * dir)
    if (this.running && this.animNames.run)
      return this.playAnimation(this.animNames.run || this.animNames.walk, LoopRepeat)
    this.playAnimation(this.animNames.walk, LoopRepeat)
  }

  sideWalk(dir = -1) {
    this.mesh.translateX(this.step * dir)
    this.playAnimation(this.animNames.walk, LoopRepeat)
  }

  turn(dir = -1) {
    this.mesh.rotateY(this.turnAngle * dir)
  }

  fall() {
    if (this.position.y == this.groundY) return

    if (this.position.y - this.jumpStep >= this.groundY) {
      this.mesh.translateY(-this.jumpStep)
      this.playAnimation(this.animNames.fall || this.animNames.jump, LoopRepeat)
    }
  }

  jump() {
    this.mesh.translateY(this.jumpStep)
    this.playAnimation(this.animNames.jump, LoopRepeat)
  }

  attack() {
    this.playAnimation(this.animNames.attack, LoopOnce)
  }

  special() {
    this.playAnimation(this.animNames.special, LoopOnce)
  }

  /* ANIMATIONS */

  playAnimation(name, loop) {
    if (!this.animations || this.shouldNotPlay(name, loop)) return

    if (this.action) this.action.stop()
    const clip = this.animations.find(clip => clip.name == name)
    this.action = clip ? this.mixer.clipAction(clip) : this.action
    // if (!this.action) return
    this.action.setLoop(loop)
    this.action.play()
  }

  shouldNotPlay(nextClip) {
    const { action } = this
    return action && (
      action._clip.name == nextClip || // don't start the same clip over again
      action.loop == LoopOnce && action.isRunning() // wait one-time animation to finish
    )
  }

  /* GETTERS */

  get position() {
    return this.mesh.position
  }

  get x() {
    return this.mesh.position.x
  }

  get z() {
    return this.mesh.position.z
  }

  get angle() {
    const { rotation } = this.mesh
    const rotationY = rotation.x == 0 ? rotation.y : Math.PI - rotation.y
    return -rotationY - Math.PI * .5
  }

  add(obj) {
    this.mesh.add(obj)
  }

  /* ALIASES */

  addSolids(...newSolids) {
    addSolids(this.solids, ...newSolids)
  }

  directionBlocked(vector) {
    return directionBlocked(this.mesh, this.solids, vector)
  }

  /* LOOP */

  updateGround() {
    this.groundY = raycastGround(this, { y: this.size * 2 })
  }

  update(delta) {
    this.updateGround()
    this.handleInput(delta)

    if (this.controls) {
      this.controls.target = this.mesh.position
      this.controls.update()
    }

    const runDelta = (this.running && !this.animNames.run) ? delta * 2 : delta
    if (this.mixer) this.mixer.update(runDelta)
  }
}
