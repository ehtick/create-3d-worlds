import WalkState from '../states/WalkState.js'

export default class AIWalkState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.up = true
  }

  update(delta) {
    const { player } = this

    /* TRANSIT */

    if (player.targetSpotted)
      player.setState('pursue')

    super.update(delta)
  }

  exit() {
    this.input.up = false
    super.exit()
  }
}
