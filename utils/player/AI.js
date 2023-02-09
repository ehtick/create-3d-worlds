import { Box3, Vector3, MathUtils } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'

const { randFloatSpread } = MathUtils

export default class AI extends Player {
  constructor({ jumpStyle = 'JUMP', state = 'idle', mapSize, ...params } = {}) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), getState: name => getAIState(name, jumpStyle) })

    this.isAI = true
    this.steeringForce = new Vector3(0, 0, 0)
    this.mesh.rotateY(Math.random() * Math.PI * 2)
    this.setState(state)
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

  /* AI ACTIONS */

  bounce() {
    if (!this.outOfBounds) return
    this.mesh.rotateY(Math.PI)
    this.mesh.translateZ(this.velocity.z)
  }

  getPredicted(target) {
    const velocity = target.velocity.clone()
    const lookAheadTime = this.position.distanceTo(target.position) / this.speed
    return target.position.clone().add(velocity.setLength(lookAheadTime))
  }

  seek(position) {
    const desiredVelocity = position.clone().sub(this.position)
    desiredVelocity.normalize().setLength(this.speed).sub(this.velocity)
    this.steeringForce.add(desiredVelocity)
  }

  flee(position) {
    const desiredVelocity = position.clone().sub(this.position)
    desiredVelocity.normalize().setLength(this.speed).sub(this.velocity)
    this.steeringForce.sub(desiredVelocity)
  }

  pursue(target) {
    this.seek(this.getPredicted(target))
  }

  evade(target) {
    this.flee(this.getPredicted(target))
  }

  idle() {
    this.velocity.setLength(0)
    this.steeringForce.set(0, 0, 0)
  }

  /* UPDATE */

  update(delta) {
    super.update(delta)
    this.velocity.add(this.steeringForce)
    this.steeringForce.set(0, 0, 0)
    if (this.boundaries) this.bounce()
  }
}
