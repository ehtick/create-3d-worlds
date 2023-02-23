import WalkState from '../states/WalkState.js'

export default class AIWalkState extends WalkState {
  update(delta) {
    const { player } = this

    this.keyboard.up = true

    /* TRANSIT */

    if (player.targetInSight)
      player.setState('pursue')

    super.update(delta)
  }
}
