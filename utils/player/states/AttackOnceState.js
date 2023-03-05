import SpecialState from './SpecialState.js'

export default class AttackOnceState extends SpecialState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.attack()
  }
}