import { MathUtils } from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import State from '../states/State.js'

const { randInt, randFloat } = MathUtils

function rotate(mesh, duration = 2000) {
  const y = randFloat(-Math.PI / 4, Math.PI / 4)
  new TWEEN.Tween(mesh.rotation)
    .to({ y }, duration)
    .start()
}

export default class IdleState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, 4)

    this.last = Date.now()
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    if (Date.now() - this.last >= this.interval) {
      rotate(this.player.mesh, this.interval / 2)
      this.last = Date.now()
    }

    TWEEN.update()
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
