import { MathUtils } from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import IdleState from '../states/IdleState.js'

const { randInt, randFloat } = MathUtils

function rotate(mesh, duration = 2000) {
  new TWEEN.Tween(mesh.rotation)
    .to({ y: randFloat(-Math.PI / 4, Math.PI / 4) }, duration)
    .start()
}

export default class AIIdleState extends IdleState {
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
    TWEEN.update()
    super.update(delta)
  }
}
