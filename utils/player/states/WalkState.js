import State from './State.js'

const chooseDuration = prevState => {
  if (prevState === 'idle') return .25
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .5
}

export default class WalkState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    if (!this.actions.walk) return

    if (this.prevState === 'run') this.syncLegs()

    this.transitFrom(oldAction, chooseDuration(oldState.name))

    if (this.player.input.down) this.reverseAction()
  }

  update(delta) {
    const { player } = this

    player.updateMove(delta)
    player.updateTurn(delta)
    player.updateStrafe(delta)

    /* TRANSIT */

    if (player.input.space)
      player.setState('jump')

    if (player.inAir)
      player.setState('fall')

    if (player.input.attack)
      player.setState('attack')

    if (player.input.run)
      player.setState('run')

    if (!player.input.up && !player.input.down
      && !player.input.sideLeft && !player.input.sideRight)
      player.setState('idle')
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}