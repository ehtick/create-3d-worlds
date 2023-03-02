import RunState from '../states/RunState.js'

export default class PursueState extends RunState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.run = this.input.up = true
  }

  update(delta) {
    const { player } = this

    player.lookAtTarget()
    player.updateMove(delta, 'TRANSLATE')

    /* TRANSIT */

    if (player.distancToTarget < player.attackDistance)
      player.setState('attack')

    if (!player.targetSpotted)
      player.setState(player.baseState)
  }

  exit() {
    this.input.run = this.input.up = false
  }
}
