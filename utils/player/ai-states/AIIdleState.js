import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update() {
    const { player } = this
    const { basicState, minFollowDistance } = player

    this.turnPeriodically(this.interval, Math.PI / 4)

    /* TRANSIT */

    if (player.pursueMode && player.targetSpotted)
      player.setState('pursue')

    if (basicState == 'flee' && player.targetNear)
      player.setState('flee')

    if (basicState == 'follow' && player.targetNear && player.distancToTarget > minFollowDistance * 1.25)
      player.setState('follow')

    // super.update(delta)
  }
}
