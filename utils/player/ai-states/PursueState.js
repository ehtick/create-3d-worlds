import { MathUtils } from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = MathUtils

export default class PursueState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.randomizeAction()
    this.keyboard.pressed.ArrowUp = true
    this.aimInterval = randInt(300, 600)
  }

  update(delta) {
    const { player } = this

    if (Date.now() - this.last < this.aimInterval) return

    player.lookAtTarget()

    /* TRANSIT */

    if (player.distancToTarget < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
