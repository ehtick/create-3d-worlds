import State from '../states/State.js'

export default class IdleState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, 4)
  }

  update(delta) {}
}
