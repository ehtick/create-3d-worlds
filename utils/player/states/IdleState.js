import State from './State.js'

const chooseDuration = prevState => {
  if (prevState === 'jump') return .25
  return .75
}

export default class IdleState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    this.action?.setEffectiveTimeScale(1)
    const duration = chooseDuration(oldState?.name)

    if (!oldAction) this.player.mixer?.stopAllAction()

    if (this.action && oldAction) {
      if (this.prevState === 'walk' || this.prevState === 'run') this.syncTime()
      this.action.crossFadeFrom(oldAction, duration)
    }

    if (!this.action && oldAction)
      oldAction.fadeOut(duration)

    this.action?.play()
  }

  update(delta) {
    this.player.turn(delta)

    if (this.keyboard.up || this.keyboard.down || this.joystick?.forward < 0
      || this.keyboard.sideLeft || this.keyboard.sideRight)
      this.player.setState('walk')

    if (this.player.inAir)
      this.player.setState('fall')

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.player.setState('attack')

    if (this.keyboard.control)
      this.player.setState('special')

    if (this.keyboard.backspace)
      this.player.setState('pain')

    if (this.keyboard.pressed.Delete)
      this.player.setState('death')
  }
}
