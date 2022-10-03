import State from './State.js'

export default class FlyState extends State {
  update(delta) {
    const { mesh } = this.fsm

    const jumpStep = this.fsm.speed * delta * 1.5
    mesh.translateY(this.keyboard.jump ? jumpStep : -jumpStep)

    this.forward(delta)
    this.turn(delta)

    if (mesh.position.y <= this.fsm.groundY) {
      mesh.position.y = this.fsm.groundY
      this.fsm.setState(this.prevState || 'idle')
    }
  }
}