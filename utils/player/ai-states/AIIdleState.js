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
    const { baseState, followDistance } = player

    this.turnEvery(this.interval, Math.PI / 4)

    if (player.mesh.userData.hitAmount)
      player.lookAtTarget()

    /* TRANSIT */

    if (player.inAir)
      player.setState('fall')

    if (player.inPursueState && player.targetSpotted)
      player.setState('pursue')

    if (baseState == 'flee' && player.targetNear)
      player.setState('flee')

    if (baseState == 'follow' && player.targetNear && player.distancToTarget > followDistance * 1.25)
      player.setState('follow')
  }
}
