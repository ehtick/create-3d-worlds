import State from './State.js'

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = this.prevState === 'jump' ? .15 : .75

    if (this.actions.run)
      this.transitFrom(oldAction, duration)

    if (!this.actions.run) {
      this.actions.walk?.setEffectiveTimeScale(1.5)
      this.actions.walk?.play()
    }
    if (this.player.controlsDown) this.reverseAction()
  }

  update(delta) {
    const { player } = this

    player.updateMove(delta)
    player.updateTurn(delta)
    player.updateStrafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')

    if (!this.player.controlsRun)
      player.setState('walk')

    if (!this.player.controlsUp && !this.player.controlsDown
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      player.setState('idle')
  }
}