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
    const { mesh, defaultState, target, idleDistance, sightDistance } = this.player
    this.turnPeriodically(this.interval, Math.PI / 4)

    if (defaultState == 'pursue' && mesh.position.distanceTo(target.position) < sightDistance)
      this.player.setState('pursue')

    if (defaultState == 'flee' && mesh.position.distanceTo(target.position) < sightDistance)
      this.player.setState('flee')

    if (defaultState == 'follow' && mesh.position.distanceTo(target.position) > idleDistance * 1.25)
      this.player.setState('follow')

    super.update(delta)
  }
}
