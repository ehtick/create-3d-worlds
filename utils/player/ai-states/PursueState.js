import { MathUtils } from 'three'
import WalkState from '../states/WalkState.js'
import { directionBlocked } from '/utils/helpers.js'
import { dir } from '/utils/constants.js'

const { randInt, randFloatSpread } = MathUtils

export default class PursueState extends WalkState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.randomizeAction()
    this.keyboard.pressed.ArrowUp = true
    this.aimInterval = randInt(300, 600)

    const { mesh } = this.player
    this.otherAi = mesh.parent.children.filter(m => m.name == 'enemy' && m !== mesh)
  }

  update(delta) {
    const { player } = this

    if (Date.now() - this.last > this.aimInterval) {
      player.mesh.lookAt(player.target.position)
      player.mesh.rotateY(Math.PI)
    }

    // TODO: koristiti distanceTo umesto raycast?
    this.keyboard.pressed.ArrowUp = !directionBlocked(player.mesh, this.otherAi, dir.forward)

    if (Date.now() - this.last < this.aimInterval) return

    /* TRANSIT */

    if (player.position.distanceTo(player.target.position) < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
