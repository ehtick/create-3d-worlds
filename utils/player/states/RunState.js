import State from './State.js'

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = this.prevState === 'jump' ? .15 : .75
    const sign = this.keyboard.down || this.joystick?.forward > 0 ? -1 : 1

    if (this.actions.run) {
      if (this.prevState === 'walk') this.syncTime()
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      this.action.setEffectiveTimeScale(sign)
    }

    if (!this.actions.run) {
      this.action = this.actions.walk
      if (this.action && oldAction && this.prevState !== 'walk') this.action.crossFadeFrom(oldAction, duration)
      this.action?.setEffectiveTimeScale(1.5 * sign)
    }

    this.action?.play()
    if (this.action) this.action.enabled = true
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

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}