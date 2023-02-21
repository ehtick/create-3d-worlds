import State from './State.js'

export default class WoundedState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, .5)
    this.player.speed *= .2
  }

  update(delta) {
    const { player } = this

    this.action?.setEffectiveTimeScale(this.keyboard.keyPressed ? 1 : 0.1)

    player.updateMove(delta)
    player.updateTurn(delta)
  }
}