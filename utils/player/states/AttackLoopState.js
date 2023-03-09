import State from './State.js'

export default class AttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
    if (this.actor.startAttack) this.actor.startAttack()
  }

  update(delta) {
    const { actor } = this

    if (actor.updateAttack) actor.updateAttack(delta)

    if (!actor.input.attack && !actor.input.attack2)
      actor.setState(this.prevOrIdle)
  }

  exit() {
    if (this.actor.endAttack) this.actor.endAttack()
  }
}
