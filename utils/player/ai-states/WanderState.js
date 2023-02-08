import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randFloat } = THREE.MathUtils

function rotate(mesh) {
  const y = randFloat(-1, 1)
  new TWEEN.Tween(mesh.rotation)
    .to({ y, })
    .start()
}

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    // this.turn()
  }

  turn() {
    this.player.mesh.rotateY(randFloat(-1, 1))
  }

  update(delta) {
    if (Math.random() > 0.995)
      rotate(this.player.mesh)

    TWEEN.update()
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
