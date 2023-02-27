import State from '../states/State.js'

export default class AIAttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
    this.i = 0
  }

  update() {
    const { player } = this

    if (this.i++ % 10 === 0)
      player.lookAtTarget()

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.previousOrIdle)
  }
}
