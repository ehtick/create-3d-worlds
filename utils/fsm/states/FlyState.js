import State, { GRAVITY } from './State.js'
import { dir } from '/data/constants.js'

const maxVelocity = .1

export default class FlyState extends State {
  update(delta) {
    this.freeFall(delta)

    if (this.keyboard.up) this.speed = this.fsm.speed
    if (this.keyboard.down) this.speed = -this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    const step = GRAVITY * delta * 10

    if (this.keyboard.space) {
      // if (this.keyboard.up && this.directionBlocked(dir.upForward))
      //   this.fsm.setState('fall')

      // if (this.keyboard.down && this.directionBlocked(dir.upBackward))
      //   this.fsm.setState('fall')

      if (this.directionBlocked(dir.up))
        this.fsm.setState('fall')

      this.fsm.velocityY += step

      if (this.fsm.velocityY > maxVelocity)
        this.fsm.velocityY = maxVelocity
    }

    if (this.fsm.inAir && !this.keyboard.space)
      this.fsm.setState('fall')

    if (!this.fsm.inAir)
      this.fsm.setState('idle')

  }
}