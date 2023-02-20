import { MathUtils } from 'three'
import State from '../states/State.js'

const { randInt } = MathUtils

export default class AIAttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .25)
    this.attackTime = randInt(1500, 2500)
    this.i = 0
  }

  update() {
    const { player } = this

    if (this.i++ % 10 === 0)
      player.lookAtTarget()

    if (Date.now() - this.last >= this.attackTime)
      player.setState(this.prevState || 'idle')

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.prevState || 'idle')
  }
}
