import { MathUtils } from 'three'
import RunState from '../states/RunState.js'

const { randInt } = MathUtils

export default class FleeState extends RunState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    this.minFleeTime = randInt(500, 1000)
  }

  update(delta) {
    const { player } = this

    this.input.up = this.input.run = true

    player.updateMove(delta) // order is important
    player.mesh.lookAt(player.target.position) // looks away

    if (Date.now() - this.last > this.minFleeTime && !player.targetSpotted)
      player.setState('idle')
  }

  exit() {
    this.input.run = this.input.up = false
    super.exit()
  }
}
