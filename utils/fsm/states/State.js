import * as THREE from 'three'
import { directionBlocked } from '/utils/helpers.js'
import { dir, RIGHT_ANGLE } from '/data/constants.js'

const INERTIA = .18
export const GRAVITY = .9

let velocity = 0
const minVelocityY = -.1

export default class State {
  constructor(fsm, name) {
    this.fsm = fsm
    this.name = name
    this.action = fsm?.actions[name]
    this.prevState = ''
    this.t = 0
  }

  get keyboard() {
    return this.fsm.keyboard
  }

  get joystick() {
    return this.fsm.joystick
  }

  get actions() {
    return this.fsm.actions
  }

  enter(oldState) {
    this.prevState = oldState?.name
    this.oldSpeed = oldState?.speed || 0
    this.speed = oldState?.speed
    if (this.action) this.action.enabled = true
  }

  update(delta) {
    this.t = Math.min(this.t + delta, 1) // t is for lerp, 1 is lerp limit
  }

  exit() { }

  /* COMMON ACTIONS */

  directionBlocked(vector) {
    return directionBlocked(this.fsm.mesh, this.fsm.solids, vector)
  }

  forward(delta, sign = -1) {
    if (!delta || !this.fsm.speed || !this.speed) return

    const jumpDir = sign === -1 ? dir.upForward : dir.upBackward
    if (this.keyboard.space && this.directionBlocked(jumpDir)) return

    const direction = sign === -1 ? dir.forward : dir.backward
    if (this.directionBlocked(direction)) return

    velocity += this.speed * this.fsm.speed * (this.joystick?.forward || sign)
    velocity *= INERTIA
    this.fsm.mesh.translateZ(velocity * delta)
  }

  turn(delta, sign = -1) {
    if (!delta || !this.fsm.speed) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.joystick)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -this.joystick.turn)

    if (this.keyboard.left)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -sign)
    if (this.keyboard.right)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * sign)
  }

  freeFly(delta) {
    const { mesh, inAir, groundY } = this.fsm
    const gravityStep = GRAVITY * delta

    if (this.fsm.velocityY - gravityStep >= minVelocityY)
      this.fsm.velocityY -= gravityStep

    if (this.fsm.velocityY > 0 && this.directionBlocked(dir.up))
      return

    mesh.translateY(this.fsm.velocityY)
    if (!inAir && !this.keyboard.space) mesh.position.y = groundY
  }

  syncTime() {
    const oldAction = this.actions[this.prevState]
    if (!this.action || !oldAction) return
    const ratio = this.action.getClip().duration / oldAction.getClip().duration
    this.action.time = oldAction.time * ratio
  }

  // https://gist.github.com/rtpHarry/2d41811d04825935039dfc075116d0ad
  reverseAction() {
    if (!this.action) return
    if (this.action.time === 0)
      this.action.time = this.action.getClip().duration
    this.action.paused = false
    this.action.setEffectiveTimeScale(-1)
  }
}