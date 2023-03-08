import State from './State.js'

export default class AttackLoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
  }

  update(delta) {
    const { actor } = this

    if (actor.attackUpdate) actor.attackUpdate(delta)

    if (!actor.input.attack)
      actor.setState(this.prevOrIdle)
  }
}
