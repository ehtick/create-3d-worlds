import { MathUtils } from 'three'
import State from '../states/State.js'

const { randInt } = MathUtils

export default class AIAttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .25)
    this.loopTime = randInt(1500, 2500)
    this.i = 0
  }

  update() {
    const { player } = this

    if (this.i++ % 10 === 0)
      player.lookAtTarget()

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.previousOrIdle)

    if (Date.now() - this.last >= this.loopTime)
      player.setState(this.previousOrIdle)
  }
}
