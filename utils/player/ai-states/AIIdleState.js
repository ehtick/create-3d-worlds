import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.keyboard.pressed.ArrowUp = false
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { player } = this
    const { basicState, idleDistance } = player

    this.turnPeriodically(this.interval, Math.PI / 4)

    /* TRANSIT */

    if (player.mesh.userData.energy <= 0)
      player.setState('death')

    if (player.pursueMode && player.targetInSight)
      player.setState('pursue')

    if (basicState == 'flee' && player.targetInSight)
      player.setState('flee')

    if (basicState == 'follow' && player.distancToTarget > idleDistance * 1.25)
      player.setState('follow')

    super.update(delta)
  }
}
