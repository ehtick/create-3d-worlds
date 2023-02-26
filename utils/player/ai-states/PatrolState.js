import WalkState from '../states/WalkState.js'

export default class PatrolState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.up = true
    this.distance = 0
  }

  update(delta) {
    const { player } = this

    this.distance += Math.abs(player.velocity.z)

    if (this.distance >= player.patrolLength) {
      player.turnSmooth()
      this.distance = 0
    }

    if (player.mesh.userData.hitAmount)
      player.lookAtTarget()

    /* TRANSIT */

    if (this.targetSpotted)
      player.setState('pursue')

    super.update(delta)
  }

  exit() {
    this.input.up = false
    super.exit()
  }
}
