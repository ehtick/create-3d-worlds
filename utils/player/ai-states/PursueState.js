import WalkState from '../states/WalkState.js'

export default class PursueState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { player } = this

    player.mesh.lookAt(player.target.position)
    player.mesh.rotateY(Math.PI) // fix
    this.keyboard.pressed.ArrowUp = true

    /* TRANSIT */

    if (player.position.distanceTo(player.target.position) < player.attackDistance)
      player.setState('attack')

    if (!player.targetInSight)
      player.setState(player.basicState || 'idle')

    super.update(delta)
  }
}
