import WalkState from '../states/WalkState.js'

export default class PursueState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { player } = this

    player.lookAtTarget()
    this.keyboard.pressed.ArrowUp = true

    if (player.distancToTarget < player.idleDistance)
      player.setState('idle')

    super.update(delta)
  }
}
