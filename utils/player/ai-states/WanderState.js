import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import WalkState from '../states/WalkState.js'

const { randFloat } = THREE.MathUtils

const rotate = mesh => new TWEEN.Tween(mesh.rotation)
  .to({ y: randFloat(-1, 1) })
  .start()

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.player.mesh.rotateY(randFloat(-1, 1))
  }

  update(delta) {
    if (Math.random() > 0.995)
      rotate(this.player.mesh)

    this.keyboard.pressed.ArrowUp = true
    TWEEN.update(delta)
    super.update(delta)
  }
}
