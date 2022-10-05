import * as THREE from 'three'
import State, { GRAVITY } from './State.js'

const { lerp } = THREE.MathUtils

export default class FlyState extends State {
  constructor(fsm, name) {
    super(fsm, name)
    this.maxVelocity = .1
    this.maxJumpTime = Infinity
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    this.jumpTime = 0

    if (this.action) {
      this.action.setEffectiveTimeScale(1)
      this.action.reset()
      this.action.setLoop(THREE.LoopOnce, 1)
      this.action.clampWhenFinished = true
      if (oldAction) this.action.crossFadeFrom(oldAction, .05)
      this.action.play()
      if (this.keyboard.down) this.reverseAction()
    }

    if (!this.action)
      this.actions[this.prevState]?.setEffectiveTimeScale(this.keyboard.down ? -1 : 1)
  }

  update(delta) {
    super.update(delta)
    const speed = this.keyboard.capsLock ? this.fsm.speed * 2 : this.fsm.speed
    this.speed = lerp(this.oldSpeed, speed, this.t)
    console.log(this.oldSpeed)

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