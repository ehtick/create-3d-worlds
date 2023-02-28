import State from '../states/State.js'

export default class AttackLoopState extends State {
  constructor(...args) {
    super(...args)
    const { actions } = this.player
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
  }

  update() {
    const { player } = this

    player.lookAtTarget()

    if (player.distancToTarget > player.attackDistance)
      player.setState(this.previousOrIdle)
  }
}
