import * as THREE from 'three'
import State from '../states/State.js'

const { randFloat } = THREE.MathUtils

export default class WanderState extends State {
  enter(oldState, oldAction) {
    this.randomizeMove()
  }

  randomizeMove() {
    this.player.mesh.rotateY(randFloat(-1, 1))
    this.velocityFactor = randFloat(.75, 1.25)
  }

  update(delta) {
    const velocity = this.player.speed * delta
    if (Math.random() > 0.995)
      this.randomizeMove()
    this.player.mesh.translateZ(-velocity * this.velocityFactor)
  }
}
