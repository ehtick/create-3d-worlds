import State from './State.js'

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .75
}

export default class WalkState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, chooseDuration(oldState.name))
    if (this.keyboard.down || this.joystick?.forward > 0) this.reverseAction()
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

    if (this.keyboard.capsLock || Math.abs(this.joystick?.forward) > .75)
      this.player.setState('run')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      this.player.setState('idle')
  }
}