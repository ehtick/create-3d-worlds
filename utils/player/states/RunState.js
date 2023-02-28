import State from './State.js'

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = this.prevState === 'jump' ? .15 : .75

    if (this.prevState === 'walk') this.syncLegs()
    this.transitFrom(oldAction, duration)

    if (this.player.input.down) this.reverseAction()
  }

  update(delta) {
    const { player } = this

    player.updateMove(delta)
    player.updateTurn(delta)
    player.updateStrafe(delta)

    /* TRANSIT */

    if (this.input.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')

    if (!this.player.input.run)
      player.setState('walk')

    if (!this.player.input.up && !this.player.input.down
      && !this.input.sideLeft && !this.input.sideRight)
      player.setState('idle')
  }
}