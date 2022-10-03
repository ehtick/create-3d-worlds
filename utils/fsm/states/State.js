import * as THREE from 'three'
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

  forward(delta, sign = -1) {
    if (!delta || !this.fsm.speed || !this.speed) return
    velocity += this.speed * this.fsm.speed * (this.joystick?.forward || sign)
    velocity *= INERTIA

    const direction = sign === -1 ? dir.forward : dir.backward
    if (!this.fsm.directionBlocked(direction))
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

  updateGravity(delta) {
    const { mesh } = this.fsm // TODO: move velocityY to State
    const gravityStep = GRAVITY * delta

    if (this.fsm.velocityY - gravityStep >= minVelocityY)
      this.fsm.velocityY -= gravityStep

    mesh.translateY(this.fsm.velocityY)
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