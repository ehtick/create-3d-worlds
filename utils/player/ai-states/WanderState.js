import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

const { randInt } = THREE.MathUtils

export default class WanderState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    this.turnPeriodically(this.interval)
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
