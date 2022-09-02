import * as THREE from 'three'
import { RIGHT_ANGLE } from '/data/constants.js'
import keyboard from '/utils/classes/Keyboard.js'

let velocity = 0
const speed = 2
const FRICTION = .3

export default class State {
  constructor(fsm, name) {
    this.fsm = fsm
    this.actions = fsm.actions
    this.name = name
  }

  move(delta, sign = -1) {
    velocity += speed * sign
    velocity *= FRICTION
    this.fsm.mesh.translateZ(velocity * delta)
  }

  turn(delta, sign = -1) {
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (keyboard.left)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -sign)
    if (keyboard.right)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * sign)
  }

  enter() {}

  exit() {}

  update() {}
}