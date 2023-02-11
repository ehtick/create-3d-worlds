import WalkState from '../states/WalkState.js'

export default class PursueState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { mesh, target, followDistance } = this.player

    mesh.lookAt(target.position) // looks away?
    mesh.rotateY(Math.PI)
    this.keyboard.pressed.ArrowUp = true

    if (mesh.position.distanceTo(target.position) < followDistance)
      this.keyboard.pressed.ArrowUp = false

    super.update(delta)
  }
}
