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

    this.turnPeriodically(this.interval)

    /* TRANSIT */

    if (player.targetSpotted)
      player.setState('pursue')

    super.update(delta)
  }

  exit() {
    this.input.up = false
    super.exit()
  }
}
