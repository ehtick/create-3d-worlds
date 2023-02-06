import { mapRange } from '/utils/helpers.js'
import State from './State.js'

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = this.prevState === 'jump' ? .15 : .75
    const sign = this.keyboard.down ? -1 : 1

    if (this.actions.run) {
      if (this.prevState === 'walk') this.syncTime()
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      const timeScale = this.joystick?.forward
        ? mapRange(-this.joystick.forward, .75, 1, .75, 1.25)
        : sign
      this.action.setEffectiveTimeScale(timeScale)
    }

    if (!this.actions.run) {
      this.action = this.actions.walk
      if (this.action && oldAction && this.prevState !== 'walk') this.action.crossFadeFrom(oldAction, duration)
      const timeScale = this.joystick?.forward
        ? mapRange(-this.joystick.forward, .75, 1, 1.25, 1.75)
        : 1.5 * sign
      this.action?.setEffectiveTimeScale(timeScale)
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

    if (!this.keyboard.capsLock && !(this.joystick?.forward < -.75))
      player.setState('walk')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      player.setState('idle')
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}