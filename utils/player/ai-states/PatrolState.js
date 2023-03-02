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

    player.updateMove(delta)

    /* TRANSIT */

    if (player.inAir)
      player.setState('fall')

    if (player.targetSpotted)
      player.setState('pursue')
  }

  exit() {
    this.input.up = false
  }
}
