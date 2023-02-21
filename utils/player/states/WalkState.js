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
    if (this.prevState === 'run' && this.actions.run) this.syncLegs()

    this.transitFrom(oldAction, chooseDuration(oldState.name))

    if (this.player.controlsDown) this.reverseAction()
  }

  update(delta) {
    const { player } = this
    player.handleRoughTerrain(player.speed * delta)

    player.updateMove(delta)
    player.updateTurn(delta)
    player.updateStrafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.player.setState('jump')

    if (this.player.inAir)
      this.player.setState('fall')

    if (this.keyboard.pressed.Enter)
      this.player.setState('attack')

    if (this.player.controlsRun)
      this.player.setState('run')

    if (!this.player.controlsUp && !this.player.controlsDown
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      this.player.setState('idle')
  }
}