import RunState from '../states/RunState.js'
import { reactions } from '/utils/constants.js'

export default class PursueState extends RunState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.run = this.input.up = true
  }

  update(delta) {
    const { player } = this

    if (!player.targetAbove) player.lookAtTarget()
    player.updateMove(delta, reactions.STEP_OFF)

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
