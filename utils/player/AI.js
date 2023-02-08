import { Box3, Vector3, MathUtils } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'

const { randFloatSpread } = MathUtils

export default class AI extends Player {
  constructor({ jumpStyle = 'JUMP', mapSize, ...params } = {}) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), getState: name => getAIState(name, jumpStyle) })

    this.isAI = true
    this.mesh.rotateY(Math.random() * Math.PI * 2)
    this.randomizeAnimation()

    if (mapSize) {
      this.position.set(randFloatSpread(mapSize), 0, randFloatSpread(mapSize))
      const halfMap = mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
    }
  }

  get outOfBounds() {
    return this.position.x >= this.boundaries.max.x
      || this.position.x <= this.boundaries.min.x
      || this.position.z >= this.boundaries.max.z
      || this.position.z <= this.boundaries.min.z
  }

  randomizeAnimation() {
    this.action.time = Math.random() * this.action.getClip().duration
  }

  bounce() {
    if (!this.outOfBounds) return
    this.mesh.rotateY(Math.PI)
    this.mesh.translateZ(this.velocity.z)
  }

  update(delta) {
    super.update(delta)
    if (this.boundaries) this.bounce()
  }
}
