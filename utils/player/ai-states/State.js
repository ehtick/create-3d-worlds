import * as THREE from 'three'

import { directionBlocked } from '/utils/helpers.js'
import { dir, RIGHT_ANGLE } from '/data/constants.js'

const INERTIA = .18
export const GRAVITY = .9

let velocity = 0

export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
  }

  get actions() {
    return this.player.actions
  }

  enter(oldState) {
    // this.prevState = oldState?.name
    // this.oldSpeed = oldState?.speed || 0
    // this.speed = oldState?.speed
    // if (this.action) this.action.enabled = true
  }

  update(delta) {}

  exit() { }

  /* COMMON ACTIONS */

  directionBlocked(vector) {
    return directionBlocked(this.player.mesh, this.player.solids, vector)
  }

  forward(delta) {
    if (!delta || !this.player.speed || !this.speed) return

    const direction = this.speed > 0 ? dir.forward : dir.backward
    if (this.directionBlocked(direction)) return

    velocity += this.speed * this.player.speed * -1
    velocity *= INERTIA

    this.player.mesh.translateZ(velocity * delta)
  }

  turn(delta) {
    if (!delta || !this.player.speed) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second

    this.player.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle)
  }
}