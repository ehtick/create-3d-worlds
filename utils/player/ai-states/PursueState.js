import { MathUtils } from 'three'
import RunState from '../states/RunState.js'

const { randInt } = MathUtils

export default class PursueState extends RunState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.run = this.input.up = true
    this.player.randomizeAction()
  }

  update(delta) {
    const { player } = this

    player.lookAtTarget()

    player.updateMove(delta, false)

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
