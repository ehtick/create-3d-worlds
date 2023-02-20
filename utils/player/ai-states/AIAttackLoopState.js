import State from '../states/State.js'

export default class AIAttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .25)
    this.aimInterval = 200
  }

  update() {
    const { player } = this

    if (Date.now() - this.last >= this.aimInterval) {
      player.lookAtTarget()
      this.last = Date.now()
    }

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.prevState || 'idle')
  }
}
