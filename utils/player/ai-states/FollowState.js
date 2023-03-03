import WalkState from '../states/WalkState.js'

export default class FollowState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.up = true
    this.player.randomizeAction()
  }

  update(delta) {
    const { player } = this

    player.lookAtTarget()
    player.updateMove(delta, 'STEP_OFF')

    /* TRANSIT */

    if (!player.targetNear)
      player.setState('idle')

    if (player.distancToTarget < player.followDistance)
      player.setState('idle')
  }

  exit() {
    this.input.up = false
  }
}
