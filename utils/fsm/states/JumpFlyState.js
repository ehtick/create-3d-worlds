import * as THREE from 'three'
import State from './State.js'

const GRAVITY = 9
const maxVelocity = 4.5
const minVelocity = 1
const velocityStep = .5

let velocity = 0
let jumpTime = 0

export default class JumpFlyState extends State {
  enter(oldState, oldAction) {
    this.speed = oldState.speed
    this.prevState = oldState.name
    velocity = minVelocity
    if (this.action) {
      this.action.setEffectiveTimeScale(1)
      this.action.reset()
      this.action.setLoop(THREE.LoopOnce, 1)
      this.action.clampWhenFinished = true
      if (oldAction) this.action.crossFadeFrom(oldAction, .05)
      this.action.play()
      if (oldState.name === 'walkBackward') this.reverseAction()
    }

    if (!this.action)
      this.actions[this.prevState]?.setEffectiveTimeScale(this.prevState === 'walkBackward' ? -1 : 1)
  }

  update(delta) {
    const { mesh } = this.fsm

    this.forward(delta, this.prevState === 'walkBackward' ? 1 : -1)

    if (this.keyboard.jump && this.onGround() && velocity <= maxVelocity) {
      velocity += velocityStep
      jumpTime = velocity * GRAVITY * delta * 3
      return
    }

    if (this.action && jumpTime) {
      const scale = this.action._clip.duration / jumpTime
      this.action.setEffectiveTimeScale(this.prevState === 'walkBackward' ? -scale : scale)
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