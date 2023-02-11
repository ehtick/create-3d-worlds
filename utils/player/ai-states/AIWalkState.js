import WalkState from '../states/WalkState.js'

export default class AIWalkState extends WalkState {
  update(delta) {
    const { player } = this

    this.keyboard.pressed.ArrowUp = true

    /* TRANSIT */

    if (player.targetInSight)
      player.setState('pursue')

    super.update(delta)
  }
}
