import WalkState from '../states/WalkState.js'

export default class AIWalkState extends WalkState {
  update(delta) {
    const { player } = this

    this.input.up = true

    /* TRANSIT */

    if (player.targetSpotted)
      player.setState('pursue')

    super.update(delta)
  }
}
