import SpecialState from '../states/SpecialState.js'

export default class AttackOnceState extends SpecialState {
  constructor(...args) {
    super(...args)
    const { actions } = this.player
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
  }

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.lookAtTarget()
  }
}