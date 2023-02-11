import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import WalkState from '../states/WalkState.js'

const turnAround = mesh => new TWEEN.Tween(mesh.rotation)
  .to({ y: mesh.rotation.y + Math.PI })
  .start()

export default class PatrolState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.walked = 0
  }

  update(delta) {
    const { player } = this
    this.keyboard.pressed.ArrowUp = true
    this.walked += Math.abs(player.velocity.z)

    if (this.walked >= player.patrolLength) {
      turnAround(player.mesh)
      this.walked = 0
    }

    if (this.targetInSight)
      player.setState('pursue')

    super.update(delta)
  }
}
