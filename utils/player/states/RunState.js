import State from './State.js'

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = this.prevState === 'jump' ? .15 : .75

    if (this.actions.run)
      this.transitFrom(oldAction, duration)

    if (!this.actions.run) {
      this.action?.setEffectiveTimeScale(1.5)
      this.action?.play()
    }
    if (this.player.controlsDown) this.reverseAction()
  }

  update(delta) {
    const { player } = this

    player.move(delta)
    player.turn(delta)
    player.strafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')

    if (!this.player.controlsRun)
      player.setState('walk')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      player.setState('idle')
  }
}