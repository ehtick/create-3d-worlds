import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { mesh, target, minDistance, maxDistance } = this.player
    this.turnPeriodically(this.interval, Math.PI / 4)

    if (this.player.defaultState == 'pursue' && mesh.position.distanceTo(target.position) > minDistance * 1.5)
      this.player.setState('pursue')

    if (this.player.defaultState == 'flee' && mesh.position.distanceTo(target.position) < maxDistance * .75)
      this.player.setState('flee')

    super.update(delta)
  }
}
