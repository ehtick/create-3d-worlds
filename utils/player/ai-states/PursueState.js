import WalkState from '../states/WalkState.js'

export default class PursueState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { player } = this
    player.mesh.lookAt(player.target.position)
    player.mesh.rotateY(Math.PI) // bugfix?
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
