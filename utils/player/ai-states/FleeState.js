import WalkState from '../states/WalkState.js'

export default class FleeState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { mesh, target, maxDistance } = this.player

    mesh.lookAt(target.position) // looks away?
    this.keyboard.pressed.ArrowUp = true

    if (mesh.position.distanceTo(target.position) >= maxDistance)
      this.keyboard.pressed.ArrowUp = false

    super.update(delta)
  }
}
