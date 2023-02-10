import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import WalkState from '../states/WalkState.js'

export default class PatrolState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.total = 0
  }

  update(delta) {
    const { player } = this
    this.keyboard.pressed.ArrowUp = true
    this.total += Math.abs(player.velocity.z)
    if (this.total >= player.patrolDistance) {
      this.total = 0
      new TWEEN.Tween(player.mesh.rotation)
        .to({ y: player.mesh.rotation.y + Math.PI })
        .start()
    }
    super.update(delta)
  }
}
