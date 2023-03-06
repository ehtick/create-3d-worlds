import State from './State.js'

export default class WoundedState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, .5)
    this.actor.speed *= .2
  }

  update(delta) {
    const { actor } = this

    this.action?.setEffectiveTimeScale(this.input.keyPressed ? 1 : 0.1)

    actor.updateMove(delta)
    actor.updateTurn(delta)
  }
}