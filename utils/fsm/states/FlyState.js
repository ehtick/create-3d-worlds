import State, { GRAVITY } from './State.js'
import { dir } from '/data/constants.js'

const maxVelocity = .1

export default class FlyState extends State {
  update(delta) {
    const { mesh, groundY } = this.fsm

    this.updateGravity(delta)

    if (this.keyboard.up) this.speed = this.fsm.speed
    if (this.keyboard.down) this.speed = -this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    /* LOGIC */

    const step = GRAVITY * delta * 10

    if (this.keyboard.jump) {
      if (this.fsm.directionBlocked(dir.up))
        return this.fsm.setState('fall')

      this.fsm.velocityY += step

      if (this.fsm.velocityY > maxVelocity)
        this.fsm.velocityY = maxVelocity
    }

    if (!this.fsm.inAir) {
      mesh.position.y = groundY
      this.fsm.setState(this.prevState || 'idle')
    }
  }
}