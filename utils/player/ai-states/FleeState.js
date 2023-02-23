import { MathUtils } from 'three'
import RunState from '../states/RunState.js'

const { randInt } = MathUtils

export default class FleeState extends RunState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    this.minFlee = randInt(500, 1000)
  }

  update(delta) {
    const { player } = this

    player.mesh.lookAt(player.target.position) // looks away?
    this.keyboard.pressed.ArrowUp = this.keyboard.run = true

    super.update(delta)

    if (Date.now() - this.last > this.minFlee && !player.targetInSight)
      player.setState('idle')
  }

  exit() {
    this.keyboard.run = this.keyboard.pressed.ArrowUp = false
    super.exit()
  }
}
