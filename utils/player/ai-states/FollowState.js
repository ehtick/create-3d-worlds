import WalkState from '../states/WalkState.js'

export default class FollowState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.up = true
    this.player.randomizeAction()
    this.i = 0
  }

  update(delta) {
    const { player } = this

    player.lookAtTarget()
    player.updateMove(delta, false)

    /* TRANSIT */

    if (!player.targetNear)
      player.setState('idle')

    if (player.distancToTarget < player.closeDistance)
      player.setState('idle')
  }

  exit() {
    this.input.up = false
  }
}
