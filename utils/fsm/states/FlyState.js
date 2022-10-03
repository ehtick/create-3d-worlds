import State from './State.js'

export default class FlyState extends State {
  update(delta) {
    const { mesh } = this.fsm

    if (this.keyboard.up) this.speed = this.fsm.speed
    if (this.keyboard.down) this.speed = -this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    if (this.keyboard.jump)
      mesh.translateY(-this.fsm.gravity * 2 * delta)

    if (!this.fsm.inAir)
      this.fsm.setState(this.prevState || 'idle')
  }
}