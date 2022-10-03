import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { mesh, groundY } = this.fsm

    this.updateGravity(delta)

    if (!this.fsm.inAir) {
      mesh.position.y = groundY
      this.fsm.setState(this.prevState || 'idle')
    }
  }
}