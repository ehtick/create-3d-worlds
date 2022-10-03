import * as THREE from 'three'
import State from './State.js'

const maxVelocity = 1
const jumpTime = 0

export default class JumpFlyState extends State {
  enter(oldState, oldAction) {
    this.speed = oldState.speed
    this.prevState = oldState.name
    // this.fsm.velocityY = .1
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
    this.forward(delta, this.prevState === 'walkBackward' ? 1 : -1)

    if (this.keyboard.jump && !this.fsm.inAir && this.fsm.velocityY <= maxVelocity) {
      const velocityStep = this.fsm.gravity * delta * 20
      this.fsm.velocityY += velocityStep

      if (this.fsm.velocityY > maxVelocity)
        this.fsm.velocityY = maxVelocity

      // jumpTime = velocityY * GRAVITY * delta * 3
      return
    }

    if (this.action && jumpTime) {
      const scale = this.action._clip.duration / jumpTime
      this.action.setEffectiveTimeScale(this.prevState === 'walkBackward' ? -scale : scale)
    }

    if (!this.fsm.inAir)
      this.fsm.setState(this.prevState || 'idle')
  }

  exit() {
    this.speed *= .75
  }
}