import { Box3, Vector3, MathUtils } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'
import { dir, jumpStyles } from '/utils/constants.js'

const { randFloatSpread } = MathUtils

/**
 * basic states that pursue (if target): idle, patrol, wander
 * basic states that doesn't pursue: flee i follow
 */
export default class AI extends Player {
  constructor({
    jumpStyle = jumpStyles.JUMP, basicState = 'idle', shouldRaycastGround = false, sightDistance = 30, idleDistance = 3, attackDistance = 2, patrolLength = 10, target, mapSize, ...params
  } = {}) {
    super({
      ...params,
      mesh: clone(params.mesh),
      keyboard: new Keyboard(false),
      getState: name => getAIState(name, jumpStyle, params.attackStyle),
      shouldRaycastGround,
    })
    this.basicState = basicState
    this.target = target
    this.idleDistance = idleDistance
    this.sightDistance = sightDistance
    this.attackDistance = attackDistance
    this.patrolLength = patrolLength

    // game props for raycast
    this.mesh.name = 'enemy'

    if (this.action) this.randomizeAction()
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

  get distancToTarget() {
    return this.position.distanceTo(this.target.position)
  }

  get targetInSight() {
    if (!this.target) return false
    return this.distancToTarget < this.sightDistance
  }

  get otherAi() {
    return this.mesh.parent.children.filter(child => child.name == 'enemy' && child !== this.mesh)
  }

  get blocked() {
    return this.directionBlocked(dir.forward, this.otherAi)
  }

  /* UTILS */

  addSolids(solids) {
    const notMe = Array.isArray(solids)
      ? solids.filter(solid => solid !== this.mesh)
      : solids
    super.addSolids(notMe)
  }

  lookAtTarget() {
    const { x, z } = this.target.position
    const newPos = new Vector3(x, this.position.y, z)
    this.mesh.lookAt(newPos)
    this.mesh.rotateY(Math.PI)
  }

  bounce(angle = Math.PI) {
    this.turn(angle)
    this.mesh.translateZ(this.velocity.z)
  }

  translateSmooth(x) {
    new TWEEN.Tween(this.mesh.position)
      .to({ x: this.mesh.position.x + x }, 500)
      .start()
  }

  turnSmooth(angle = Math.PI) {
    new TWEEN.Tween(this.mesh.rotation)
      .to({ y: this.mesh.rotation.y + angle }, 500)
      .start()
  }

  /* ANIMS */

  setupMixer(animations, animDict) {
    super.setupMixer(animations, animDict)
    const walkActions = ['wander', 'follow', 'pursue', 'flee', 'patrol']
    walkActions.forEach(name => {
      if (!this.actions[name]) this.actions[name] = this.actions.walk
    })
  }

  randomizeAction() {
    this.action.time = Math.random() * this.action.getClip().duration
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
