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
    const { mesh, basicState, target, idleDistance } = player

    this.turnPeriodically(this.interval, Math.PI / 4)

    /* TRANSIT */

    if (player.pursueMode && player.targetInSight)
      player.setState('pursue')

    if (basicState == 'flee' && player.targetInSight)
      player.setState('flee')

    if (basicState == 'follow' && mesh.position.distanceTo(target.position) > idleDistance * 1.25)
      player.setState('follow')

    super.update(delta)
  }
}
