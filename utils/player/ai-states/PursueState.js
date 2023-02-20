import { MathUtils } from 'three'
import WalkState from '../states/WalkState.js'
import { dir } from '/utils/constants.js'

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

    if (Date.now() - this.last > this.aimInterval)
      player.lookAtTarget()

    this.keyboard.pressed.ArrowUp = !player.directionBlocked(dir.forward, player.otherAi)

    if (Date.now() - this.last < this.aimInterval) return

    /* TRANSIT */

    if (player.distancToTarget < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
