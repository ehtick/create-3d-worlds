import SpecialState from '../states/SpecialState.js'

export default class AIAttackState extends SpecialState {
  constructor(...args) {
    super(...args)
    const { actions } = this.player
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
  }

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.mesh.lookAt(this.player.target.position)
    this.player.mesh.rotateY(Math.PI)
  }
}