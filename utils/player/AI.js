import { Box3, Vector3, MathUtils } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'

const { randFloatSpread } = MathUtils

/**
 * basic states that pursue (if target): idle, patrol, wander
 * basic states that doesn't pursue: flee i follow
 */
export default class AI extends Player {
  constructor({
    jumpStyle = 'JUMP', basicState = 'idle', shouldRaycastGround = false, sightDistance = 30, idleDistance = 3, attackDistance = 2, patrolLength = 10, target, mapSize, ...params
  } = {}) {
    super({ ...params,
      mesh: clone(params.mesh),
      keyboard: new Keyboard(false),
      getState: name => getAIState(name, jumpStyle),
      shouldRaycastGround,
    })

    this.basicState = basicState
    this.target = target
    this.idleDistance = idleDistance
    this.sightDistance = sightDistance
    this.attackDistance = attackDistance
    this.patrolLength = patrolLength

    if (this.action) this.randomizeAnimation()
    this.mesh.rotateY(Math.random() * Math.PI * 2)

    if (mapSize) {
      this.position.set(randFloatSpread(mapSize), 0, randFloatSpread(mapSize))
      const halfMap = mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
    }

    this.setState(basicState)
  }

  /* GETTERS */

  get isAI() {
    return true
  }

  get pursueMode() {
    return ['idle', 'patrol', 'wander'].includes(this.basicState)
  }

  get outOfBounds() {
    return this.position.x >= this.boundaries.max.x
      || this.position.x <= this.boundaries.min.x
      || this.position.z >= this.boundaries.max.z
      || this.position.z <= this.boundaries.min.z
  }

  get targetInSight() {
    if (!this.target) return false
    return this.position.distanceTo(this.target.position) < this.sightDistance
  }

  /* UTILS */

  addSolids(arr) {
    const notMe = arr.filter(solid => solid !== this.mesh)
    super.addSolids(notMe)
  }

  /* ANIMS */

  randomizeAnimation() {
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* AI */

  bounce() {
    if (!this.outOfBounds) return
    this.mesh.rotateY(Math.PI)
    this.mesh.translateZ(this.velocity.z)
  }

  /* UPDATE */

  update(delta) {
    super.update(delta)
    if (this.boundaries) this.bounce()
  }
}
