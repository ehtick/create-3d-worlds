import State from './State.js'
import { mapRange } from '/utils/helpers.js'

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .75
}

export default class WalkState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction)

    const sign = this.keyboard.down ? -1 : 1
    const timeScale = this.joystick?.forward ? mapRange(-this.joystick.forward, 0, .75, .75, 1.25) : sign
    this.action?.setEffectiveTimeScale(timeScale)

    if (this.keyboard.down) this.reverseAction()
  }

  update(delta) {
    const { player } = this
    player.handleRoughTerrain(player.speed * delta)

    player.move(delta)
    player.turn(delta)
    player.strafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')

    if (this.keyboard.pressed.Enter)
      this.player.setState('attack')

    if (this.keyboard.capsLock || this.joystick?.forward < -.75)
      this.player.setState('run')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      this.player.setState('idle')
  }
}