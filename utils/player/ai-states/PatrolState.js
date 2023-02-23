import WalkState from '../states/WalkState.js'

export default class PatrolState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.walked = 0
  }

  update(delta) {
    const { player } = this

    this.input.up = true
    this.walked += Math.abs(player.velocity.z)

    if (this.walked >= player.patrolLength) {
      player.turnSmooth()
      this.walked = 0
    }

    /* TRANSIT */

    if (this.targetSpotted)
      player.setState('pursue')

    super.update(delta)
  }
}
