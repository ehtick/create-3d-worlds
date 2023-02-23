import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = THREE.MathUtils

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    const { player } = this

    this.turnPeriodically(this.interval)
    this.keyboard.up = true

    /* TRANSIT */

    if (player.targetInSight)
      player.setState('pursue')

    super.update(delta)
  }
}
