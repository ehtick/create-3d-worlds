import State from './State.js'

export default class FallState extends State {
  update(delta) {
    this.freeFly(delta)
    this.turn(delta)

    if (this.keyboard.space && this.fsm.canFly)
      this.fsm.setState('jump')

    if (!this.fsm.inAir)
      this.fsm.setState('idle')
  }
}