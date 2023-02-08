import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randFloat } = THREE.MathUtils

export default class WanderState extends WalkState {
  // enter(oldState, oldAction) {
  //   this.turn()
  // }

  turn() {
    this.player.mesh.rotateY(randFloat(-1, 1))
  }

  update(delta) {
    if (Math.random() > 0.995)
      this.turn()
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
