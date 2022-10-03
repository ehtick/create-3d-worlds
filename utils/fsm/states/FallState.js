import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { mesh, groundY } = this.fsm

    this.freeFly(delta)
    this.turn(delta)

    console.log(this.prevState)
    if (this.keyboard.space && this.fsm.fly)
      this.fsm.setState('jump')

    if (!this.fsm.inAir) {
      mesh.position.y = groundY
      this.fsm.setState('idle')
    }
  }
}