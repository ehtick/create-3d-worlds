import * as THREE from 'three'
import { dir, RIGHT_ANGLE } from '/data/constants.js'

const { lerp } = THREE.MathUtils

const INERTIA = .18

export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
    this.t = 0
  }

  get keyboard() {
    return this.player.keyboard
  }

  get joystick() {
    return this.player.joystick
  }

  get actions() {
    return this.player.actions
  }

  enter(oldState) {
    this.prevState = oldState?.name
    this.oldSpeed = oldState?.speed || 0
    this.speed = oldState?.speed
    if (this.action) this.action.enabled = true
  }

  update(delta) {
    this.t = Math.min(this.t + delta * 3, 1) // t is for lerp, 1 is limit
  }

  exit() { }

  /* COMMON ACTIONS */

  move(delta, speed = 1) {
    if (this.keyboard.up) this.speed = lerp(this.oldSpeed, this.player.speed * speed, this.t)
    if (this.keyboard.down) this.speed = lerp(this.oldSpeed, -this.player.speed * speed * .5, this.t)

    const jumpStep = Math.abs(this.speed) * delta * 1.5
    this.player.normalizeGround(jumpStep)

    this.turn(delta)
    this.forward(delta)
    this.strafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')
  }

  forward(delta) {
    const { player } = this
    if (!delta || !player.speed || !this.speed) return

    const direction = this.speed > 0 ? dir.forward : dir.backward
    if (player.directionBlocked(direction)) return
    const jumpDir = this.speed > 0 ? dir.upForward : dir.upBackward
    if (this.keyboard.space && player.directionBlocked(jumpDir)) return

    player.velocity.z += this.speed * player.speed * (this.joystick?.forward || -1) * delta
    player.velocity.z *= INERTIA

    player.mesh.translateZ(player.velocity.z)
  }

  backward(delta) {
    this.forward(delta, 1)
  }

  strafe(delta) {
    const { player } = this
    if (this.keyboard.sideLeft && !player.directionBlocked(dir.left))
      this.player.mesh.translateX(-this.player.speed * delta)

    if (this.keyboard.sideRight && !player.directionBlocked(dir.right))
      this.player.mesh.translateX(this.player.speed * delta)
  }

  turn(delta) {
    if (!delta || !this.player.speed) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.joystick)
      this.player.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -this.joystick.turn)

    if (this.keyboard.left)
      this.player.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle)
    if (this.keyboard.right)
      this.player.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -1)
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