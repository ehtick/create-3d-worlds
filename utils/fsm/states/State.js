import * as THREE from 'three'
import { RIGHT_ANGLE } from '/data/constants.js'

const INERTIA = .5

let velocity = 0

export default class State {
  constructor(fsm, name) {
    this.fsm = fsm
    this.name = name
    this.actions = fsm.actions // TODO: refactor to getters
    this.fsm.keyboard = fsm.keyboard
    this.action = fsm?.actions[name]
    this.prevState = ''
    this.t = 0
  }

  enter(oldState) {
    this.prevState = oldState?.name
  }

  move(delta, sign = -1) {
    velocity += this.speed * sign
    velocity *= INERTIA
    this.fsm.mesh.translateZ(velocity * delta)
  }

  turn(delta, sign = -1) {
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.fsm.keyboard.left)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -sign)
    if (this.fsm.keyboard.right)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * sign)
  }

  exit() { }

  update(delta) {
    this.t = Math.min(this.t + delta, 1) // t is for lerp, 1 is lerp limit
  }
}