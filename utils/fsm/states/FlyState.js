import * as THREE from 'three'
import State, { GRAVITY } from './State.js'

export default class FlyState extends State {
  constructor(fsm, name) {
    super(fsm, name)
    this.maxVelocity = .1
    this.maxJumpTime = Infinity
  }

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
    this.freeFly(delta)

    this.turn(delta)
    this.forward(delta, this.keyboard.down ? 1 : -1)

    const flyStep = GRAVITY * delta * 10

    if (this.keyboard.space && this.jumpTime < this.maxJumpTime) {
      this.fsm.velocityY += flyStep
      this.jumpTime++

      if (this.fsm.velocityY > this.maxVelocity)
        this.fsm.velocityY = this.maxVelocity
    }

    // bez prevState meša aktivne animacije
    if (!this.fsm.inAir) this.fsm.setState(this.prevState)
  }
}