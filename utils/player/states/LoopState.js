import State from '../states/State.js'

export default class LoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
  }

  update() {
    const { actor } = this

    if (!actor.input.attack)
      actor.setState(this.prevOrIdle)
  }
}
