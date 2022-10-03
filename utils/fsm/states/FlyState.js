import State from './State.js'

const maxVelocity = .1

export default class FlyState extends State {
  update(delta) {
    const { gravity } = this.fsm

    if (this.keyboard.up) this.speed = this.fsm.speed
    if (this.keyboard.down) this.speed = -this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    /* FLY LOGIC */

    const flyStep = gravity * delta * 10

    if (this.keyboard.jump) {
      this.fsm.velocityY += flyStep

      if (this.fsm.velocityY > maxVelocity)
        this.fsm.velocityY = maxVelocity
    }

    if (!this.fsm.inAir)
      this.fsm.setState(this.prevState || 'idle')
  }
}