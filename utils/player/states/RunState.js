import State from './State.js'

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  return .75
}

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    if (!this.actions.run) return

    if (this.prevState === 'walk') this.syncLegs()

    this.transitFrom(oldAction, chooseDuration(this.prevState))

    this.timeScale = this.action.timeScale
    if (this.player.input.down) this.reverseAction(this.action, -this.timeScale)
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

  exit() {
    this.action?.setEffectiveTimeScale(this.timeScale)
  }
}