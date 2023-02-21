import { MathUtils } from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = MathUtils

export default class PursueState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.randomizeAction()
    this.keyboard.pressed.ArrowUp = true
    this.startPursue = randInt(300, 600)
    this.i = 0
  }

  update(delta) {
    const { player } = this

    if (Date.now() - this.last < this.startPursue) return

    // raycast once in 50 frames (expensive operation)
    if (this.i % 50 === 0 && player.blocked)
      player.translateSmooth(.25)

    if (this.i % 2 === 0)
      player.lookAtTarget()

    this.i++

    /* TRANSIT */

    if (player.mesh.userData.energy <= 0) player.setState('death')

    if (player.distancToTarget < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
