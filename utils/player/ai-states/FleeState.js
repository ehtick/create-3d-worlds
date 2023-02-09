import WalkState from '../states/WalkState.js'

export default class FleeState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { mesh, target } = this.player
    mesh.lookAt(target.position) // looks away?
    this.keyboard.pressed.ArrowUp = true
    console.log(mesh.position.distanceTo(target.position))
    super.update(delta)
  }
}
