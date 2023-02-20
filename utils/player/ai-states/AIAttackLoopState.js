import State from '../states/State.js'

export default class AIAttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .25)
  }

  update() {
    const { player } = this
    player.lookAtTarget()

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.prevState || 'idle')
  }
}
