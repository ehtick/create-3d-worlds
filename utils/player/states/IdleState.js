import State from './State.js'

const chooseDuration = prevState => {
  if (prevState === 'jump') return .25
  return .75
}

export default class IdleState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, chooseDuration(oldState?.name))
  }

  update(delta) {
    this.player.updateTurn(delta)

    if (this.player.controlsUp || this.player.controlsDown)
      this.player.setState('walk')

    if (this.keyboard.sideLeft || this.keyboard.sideRight)
      this.player.setState('walk') // TODO: strafe state?

    if (this.player.inAir)
      this.player.setState('fall')

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.player.setState('attack')

    if (this.keyboard.pressed.ShiftRight && this.actions.attack2)
      this.player.setState('attack2')

    // if (this.keyboard.control)
    //   this.player.setState('special')

    /* ONLY FOR TEST */

    if (this.keyboard.backspace)
      this.player.setState('pain')

    if (this.keyboard.pressed.Delete)
      this.player.setState('death')
  }
}
