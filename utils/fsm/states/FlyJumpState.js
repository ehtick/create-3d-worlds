import * as THREE from 'three'
import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'

const GRAVITY = 9
const maxVelocity = 4.5
const minVelocity = 1
const velocityStep = .5

let velocity = 0
let jumpTime = 0

export default class FlyJumpState extends State {
  enter(oldState) {
    this.speed = oldState.speed
    this.prevState = oldState.name
    velocity = minVelocity

    if (!this.actions) return
    const oldAction = this.actions[oldState.name]
    this.action.reset()
    this.action.setLoop(THREE.LoopOnce, 1)
    this.action.clampWhenFinished = true
    this.action.crossFadeFrom(oldAction, .25, true)
    this.action.play()
  }

  onGround() {
    return this.fsm.mesh.position.y === 0
  }

  update(delta) {
    const { mesh } = this.fsm

    this.move(delta)

    if (keyboard.pressed.Space && this.onGround() && velocity <= maxVelocity) {
      velocity += velocityStep
      jumpTime = velocity * GRAVITY * delta * 3
      return
    }

    if (this.action && jumpTime) {
      const scale = this.action._clip.duration / jumpTime
      this.action.setEffectiveTimeScale(scale)
    }

    this.fsm.mesh.translateY(velocity * delta)
    velocity -= GRAVITY * delta

    if (mesh.position.y <= 0) {
      mesh.position.y = 0
      this.fsm.setState(this.prevState || 'idle')
    }
  }

  exit() {
    this.speed *= .75
  }
}