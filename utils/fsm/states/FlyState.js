import State from './State.js'

export default class FlyState extends State {
  update(delta) {
    const { mesh } = this.fsm

    if (this.keyboard.jump) {
      const jumpStep = this.fsm.speed * delta * 3
      mesh.translateY(jumpStep)
    }

    if (this.keyboard.up) this.speed = this.fsm.speed

    this.forward(delta)
    this.turn(delta)

    if (mesh.position.y <= this.fsm.groundY) {
      mesh.position.y = this.fsm.groundY
      this.fsm.setState(this.prevState || 'idle')
    }
  }
}