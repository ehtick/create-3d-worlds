import * as THREE from 'three'
import { RIGHT_ANGLE } from '/data/constants.js'
import keyboard from '/utils/classes/Keyboard.js'

const FRICTION = .5

let velocity = 0

/* TODO:
- lagano usporavanje iz skoka u idle
*/

export default class State {
  constructor(fsm, name) {
    this.fsm = fsm
    this.actions = fsm.actions
    this.name = name
  }

  move(delta, sign = -1, speed = 2) {
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