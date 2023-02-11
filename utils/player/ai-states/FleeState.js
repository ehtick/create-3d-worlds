import WalkState from '../states/WalkState.js'

export default class FleeState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { player } = this

    player.mesh.lookAt(player.target.position) // looks away?
    this.keyboard.pressed.ArrowUp = true

    if (!player.targetInSight)
      player.setState('idle')

    super.update(delta)
  }
}
