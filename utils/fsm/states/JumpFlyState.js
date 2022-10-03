import * as THREE from 'three'
import State, { GRAVITY } from './State.js'

const maxVelocity = .2
const maxJumpTime = 10

export default class JumpFlyState extends State {
  enter(oldState, oldAction) {
    this.speed = oldState.speed
    this.prevState = oldState.name
    this.jumpTime = 0

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
    if (this.keyboard.up) this.speed = this.fsm.speed

    this.forward(delta, this.prevState === 'walkBackward' ? 1 : -1)
    this.turn(delta)

    /* LOGIC */

    const step = GRAVITY * delta * 10

    if (this.keyboard.jump && this.jumpTime < maxJumpTime) {
      this.fsm.velocityY += step
      this.jumpTime++

      if (this.fsm.velocityY > maxVelocity)
        this.fsm.velocityY = maxVelocity
    }

    // if (this.action && this.jumpTime) {
    //   const scale = this.action._clip.duration / this.jumpTime
    //   this.action.setEffectiveTimeScale(this.prevState === 'walkBackward' ? -scale : scale)
    // }

    if (!this.fsm.inAir)
      this.fsm.setState(this.prevState || 'idle')
  }

  exit() {
    this.speed *= .75
  }
}