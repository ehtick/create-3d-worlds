import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    this.input.up = false
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { player } = this
    const { basicState, followDistance } = player

    this.turnPeriodically(this.interval, Math.PI / 4)

    /* TRANSIT */

    if (player.pursueMode && player.targetSpotted)
      player.setState('pursue')

    if (basicState == 'flee' && player.targetNear)
      player.setState('flee')

    if (basicState == 'follow' && player.distancToTarget > followDistance * 1.25)
      player.setState('follow')

    // super.update(delta)
  }
}
