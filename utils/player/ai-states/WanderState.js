import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = THREE.MathUtils

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.input.up = true
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { player } = this

    this.turnEvery(this.interval)
    player.updateMove(delta)

    if (player.mesh.userData.hitAmount)
      player.lookAtTarget()

    /* TRANSIT */

    if (player.targetSpotted)
      player.setState('pursue')
  }

  exit() {
    this.input.up = false
  }
}
