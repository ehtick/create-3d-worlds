import * as THREE from 'three'
import { RIGHT_ANGLE } from '/data/constants.js'

const INERTIA = .25

let velocity = 0

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

  get actions() {
    return this.fsm.actions
  }

  enter(oldState) {
    this.prevState = oldState?.name
    this.oldSpeed = oldState?.speed || 0
    if (this.action) this.action.enabled = true
  }

  update(delta) {
    this.t = Math.min(this.t + delta, 1) // t is for lerp, 1 is lerp limit
  }

  exit() { }

  /* COMMON ACTIONS */

  move(delta, sign = -1) {
    if (!this.fsm.speed || !this.speed) return
    velocity += this.speed * this.fsm.speed * sign
    velocity *= INERTIA
    this.fsm.mesh.translateZ(velocity * delta)
  }

  turn(delta, sign = -1) {
    if (!this.fsm.speed) return
    const angle = RIGHT_ANGLE * delta // 90 degrees per second
    if (this.keyboard.left)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * -sign)
    if (this.keyboard.right)
      this.fsm.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), angle * sign)
  }

  finishThenIdle() {
    const onFinished = () => {
      this.fsm.mixer.removeEventListener('loop', onFinished)
      this.fsm.setState('idle')
    }
    this.fsm.mixer.addEventListener('loop', onFinished)
  }

  syncLegs() {
    const oldAction = this.actions[this.prevState]
    const ratio = this.action.getClip().duration / oldAction.getClip().duration
    this.action.time = oldAction.time * ratio
  }

  prepareAction() {
    this.action.time = 0.0
    this.action.setEffectiveWeight(1)
    this.action.setEffectiveTimeScale(1)
  }

}