import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randFloat, randInt } = THREE.MathUtils

function rotate(mesh, duration = 2000) {
  new TWEEN.Tween(mesh.rotation)
    .to({ y: randFloat(-Math.PI / 2, Math.PI / 2) }, duration)
    .start()
}

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    this.last = Date.now()
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    if (Date.now() - this.last >= this.interval) {
      rotate(this.player.mesh, this.interval / 2)
      this.last = Date.now()
    }
    this.keyboard.pressed.ArrowUp = true
    TWEEN.update()
    super.update(delta)
  }
}
