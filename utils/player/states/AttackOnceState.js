import SpecialState from './SpecialState.js'

export default class AttackOnceState extends SpecialState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.done = false
  }

  update() {
    if (this.done) return
    this.player.attack()
    this.done = true
  }
}