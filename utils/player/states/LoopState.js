import State from '../states/State.js'

export default class LoopState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
  }

  update() {
    const { player } = this

    if (!player.input.attack)
      player.setState(this.prevOrIdle)
  }
}
