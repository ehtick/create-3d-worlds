import SpecialState from './SpecialState.js'

export default class AttackOnceState extends SpecialState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.done = false
    this.actor.untouchable = true
  }

  update() {
    if (this.done) return
    this.actor.startAttack()
    this.done = true
  }

  exit() {
    this.actor.untouchable = false
  }
}