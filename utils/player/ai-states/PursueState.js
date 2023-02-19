import { MathUtils } from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = MathUtils

export default class PursueState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.randomizeAction()
    this.keyboard.pressed.ArrowUp = true
    this.attackInterval = randInt(300, 500)
  }

  update(delta) {
    const { player } = this

    player.mesh.lookAt(player.target.position)
    player.mesh.rotateY(Math.PI) // fix

    if (Date.now() - this.last < this.attackInterval) return

    /* TRANSIT */

    if (player.position.distanceTo(player.target.position) < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
