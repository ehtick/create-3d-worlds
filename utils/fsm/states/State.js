import * as THREE from 'three'
import { RIGHT_ANGLE } from '/data/constants.js'
import keyboard from '/utils/classes/Keyboard.js'

const INERTIA = .5

let velocity = 0

export default class State {
  constructor(fsm, name) {
    this.fsm = fsm
    this.name = name
    this.actions = fsm.actions
    if (fsm.actions) this.action = fsm.actions[name]
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
    if (keyboard.left)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -sign)
    if (keyboard.right)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * sign)
  }

  exit() { }

  update(delta) {
    this.t = Math.min(this.t + delta, 1) // t is for lerp, 1 is lerp limit
  }
}