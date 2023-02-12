import { Box3, Vector3, MathUtils, AnimationMixer } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'
import { dir } from '/data/constants.js'

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
    this.mesh.name = 'enemy'
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

  get pursueMode() {
    return ['idle', 'patrol', 'wander'].includes(this.basicState)
  }

  get outOfBounds() {
    if (!this.boundaries) return false
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

  addSolids(solids) {
    const notMe = Array.isArray(solids)
      ? solids.filter(solid => solid !== this.mesh)
      : solids
    super.addSolids(notMe)
  }

  /* ANIMS */

  setupMixer(animations, animDict) {
    super.setupMixer(animations, animDict)
    const walkActions = ['wander', 'follow', 'pursue', 'flee', 'patrol']
    walkActions.forEach(name => {
      if (!this.actions[name]) this.actions[name] = this.actions.walk
    })
  }

  randomizeAnimation() {
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* AI */

  bounce(angle = Math.PI) {
    this.turn(angle)
    this.mesh.translateZ(this.velocity.z)
  }

  turnSmooth(angle = Math.PI) {
    new TWEEN.Tween(this.mesh.rotation)
      .to({ y: this.mesh.rotation.y + angle }, 500)
      .start()
  }

  /* UPDATE */

  updateMove(delta) {
    const direction = this.controlsUp ? dir.forward : dir.backward
    if (this.directionBlocked(direction)) this.turn(Math.PI)

    this.velocity.z += -this.acceleration * delta
    this.velocity.z *= (1 - this.drag)
    this.mesh.translateZ(this.velocity.z)
  }

  update(delta) {
    super.update(delta)
    if (this.outOfBounds) this.bounce()
    TWEEN.update()
  }
}
