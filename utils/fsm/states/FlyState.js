import State from './State.js'

export default class FlyState extends State {
  onGround() {
    return this.fsm.mesh.position.y === 0
  }

  update(delta) {
    const { mesh } = this.fsm

    const jumpStep = this.fsm.speed * delta * 1.5
    mesh.translateY(this.keyboard.jump ? jumpStep : -jumpStep)

    this.forward(delta)
    this.turn(delta)

    if (mesh.position.y <= 0) {
      mesh.position.y = 0
      this.fsm.setState(this.prevState || 'idle')
    }
  }
}