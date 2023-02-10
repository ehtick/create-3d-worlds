import WalkState from '../states/WalkState.js'

export default class FleeState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { mesh, target, maxFleeDistance } = this.player

    mesh.lookAt(target.position) // looks away?
    this.keyboard.pressed.ArrowUp = true

    if (mesh.position.distanceTo(target.position) > maxFleeDistance)
      this.keyboard.pressed.ArrowUp = false

    super.update(delta)
  }
}
