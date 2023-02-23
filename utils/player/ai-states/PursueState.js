import { MathUtils } from 'three'
import RunState from '../states/RunState.js'

const { randInt } = MathUtils

export default class PursueState extends RunState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    this.player.randomizeAction()
    this.startPursue = randInt(300, 600)
    this.i = 0
  }

  update(delta) {
    const { player } = this

    if (Date.now() - this.last < this.startPursue) return

    this.keyboard.run = this.keyboard.pressed.ArrowUp = true

    // raycast once in 50 frames (expensive operation)
    if (this.i % 50 === 0 && player.blocked)
      player.translateSmooth(.25)

    if (this.i % 2 === 0)
      player.lookAtTarget()

    this.i++

    /* TRANSIT */

    super.update(delta)

    if (player.distancToTarget < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')
  }

  exit() {
    this.keyboard.run = this.keyboard.pressed.ArrowUp = false
    super.exit()
  }
}
