import State from './State.js'

let velocityY = 0
const maxVelocity = .1
const minVelocity = -.1

const gravity = .9

export default class FlyState extends State {
  update(delta) {
    const { mesh, groundY } = this.fsm

    if (this.keyboard.up) this.speed = this.fsm.speed
    if (this.keyboard.down) this.speed = -this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    /* FLY LOGIC */

    const gravityStep = gravity * delta

    velocityY -= gravityStep

    if (this.keyboard.jump)
      velocityY += gravityStep * 2

    if (velocityY > maxVelocity) velocityY = maxVelocity
    if (velocityY < minVelocity) velocityY = minVelocity

    mesh.translateY(velocityY)

    /* END */

    if (!this.fsm.inAir) {
      this.fsm.setState(this.prevState || 'idle')
      velocityY = 0
    }

  }
}