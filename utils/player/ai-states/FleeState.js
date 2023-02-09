import WalkState from '../states/WalkState.js'

export default class FleeState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { player } = this
    player.mesh.lookAt(player.target.position)
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
