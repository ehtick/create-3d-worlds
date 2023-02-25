import State from './State.js'

const chooseDuration = prevState => {
  if (['run', 'flee', 'pursue'].includes(prevState)) return 1
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

    if (this.player.input.up || this.player.input.down)
      this.player.setState('walk')

    if (this.input.sideLeft || this.input.sideRight)
      this.player.setState('walk') // TODO: strafe state?

    if (this.player.inAir)
      this.player.setState('fall')

    if (this.input.space)
      this.player.setState('jump')

    if (this.input.pressed.Enter)
      this.player.setState('attack')

    if (this.input.pressed.ShiftRight && this.actions.attack2)
      this.player.setState('attack2')

    // if (this.input.control)
    //   this.player.setState('special')

    /* ONLY FOR TEST */

    if (this.input.backspace)
      this.player.setState('pain')

    if (this.input.pressed.Delete)
      this.player.setState('death')
  }
}
