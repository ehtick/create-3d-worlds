import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { mesh, target, pursueDistance, fleeDistance, defaultState } = this.player
    this.turnPeriodically(this.interval, Math.PI / 4)

    if (defaultState == 'pursue' && mesh.position.distanceTo(target.position) > pursueDistance * 1.25)
      this.player.setState('pursue')

    if (defaultState == 'follow' && mesh.position.distanceTo(target.position) > pursueDistance * 1.25)
      this.player.setState('follow')

    if (defaultState == 'flee' && mesh.position.distanceTo(target.position) < fleeDistance * .75)
      this.player.setState('flee')

    super.update(delta)
  }
}
