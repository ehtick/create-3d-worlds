import { Box3, Vector3, MathUtils } from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

import { Input } from '/utils/classes/Input.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'
import { dir, jumpStyles } from '/utils/constants.js'

const { randFloatSpread } = MathUtils

const walkActions = ['wander', 'follow', 'patrol']
const runActions = ['pursue', 'flee']

/**
 * basic states that pursue (if target): idle, patrol, wander
 * basic states that doesn't pursue: flee i follow
 */
export default class AI extends Player {
  constructor({
    jumpStyle = jumpStyles.JUMP, basicState = 'idle', shouldRaycastGround = false, sightDistance = 25, followDistance = 3, attackDistance = 2, patrolLength = 10, target, mapSize, coords, ...params
  } = {}) {
    super({
      ...params,
      input: new Input(false),
      getState: name => getAIState(name, jumpStyle, params.attackStyle),
      shouldRaycastGround,
    })
    this.basicState = basicState
    this.target = target
    this.followDistance = followDistance
    this.sightDistance = sightDistance
    this.attackDistance = attackDistance
    this.patrolLength = patrolLength

    // game props for raycast
    this.mesh.name = 'enemy'

    this.randomizeAction()
    this.mesh.rotateY(Math.random() * Math.PI * 2)

    if (mapSize) {
      const halfMap = mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
      if (!coords) this.position.set(randFloatSpread(mapSize), 0, randFloatSpread(mapSize))
    }

    if (coords) this.position.copy(coords.next().value)

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

  get lookingAtTarget() {
    const direction1 = this.mesh.getWorldDirection(new Vector3())
    const direction2 = this.target.getWorldPosition(new Vector3())
      .sub(this.mesh.getWorldPosition(new Vector3())).normalize()
    const dotProduct = direction1.dot(direction2)

    return (-1.3 < dotProduct && dotProduct < -0.7)
  }

  get targetSpotted() {
    if (!this.target) return false
    return (this.lookingAtTarget && this.distancToTarget < this.sightDistance)
    || (this.distancToTarget < this.sightDistance * .3) // feel if too close
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
    walkActions.forEach(name => {
      if (!this.actions[name]) this.actions[name] = this.actions.walk
    })
    runActions.forEach(name => {
      if (!this.actions[name]) this.actions[name] = this.actions.run
    })
  }

  randomizeAction() {
    if (!this.action) return
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* UPDATE */

  updateMove(delta) {
    const direction = this.input.up ? dir.forward : dir.backward
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
