import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { mesh, groundY } = this.fsm

    this.updateGravity(delta)
    this.turn(delta)

    if (!this.fsm.inAir) {
      mesh.position.y = groundY
      this.fsm.setState('idle')
    }
  }
}