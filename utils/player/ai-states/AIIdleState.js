import { MathUtils } from 'three'
import IdleState from '../states/IdleState.js'

const { randInt } = MathUtils

export default class AIIdleState extends IdleState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { mesh, target, minDistance } = this.player
    this.turnPeriodically(this.interval, Math.PI / 4)

    if (mesh.position.distanceTo(target.position) > minDistance)
      this.player.setState('pursue')

    super.update(delta)
  }
}
