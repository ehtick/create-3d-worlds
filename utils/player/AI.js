import { Box3, Vector3, MathUtils } from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

import { Input } from '/utils/classes/Input.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'
import { dir, jumpStyles } from '/utils/constants.js'

const { randFloatSpread } = MathUtils

const walkActions = ['wander', 'follow', 'patrol']
const runActions = ['pursue', 'flee']

const pursueStates = ['idle', 'patrol', 'wander']

/**
 * baseState that pursue target on sight: idle, patrol, wander
 * baseState that doesn't pursue: flee i follow
 */
export default class AI extends Player {
  constructor({
    jumpStyle = jumpStyles.JUMP, baseState = 'wander', shouldRaycastGround = false, sightDistance = 25, closeDistance = 1.5, attackDistance = 1.5, patrolLength = 10, target, mapSize, coords, ...params
  } = {}) {
    super({
      ...params,
      input: new Input(false),
      getState: name => getAIState(name, jumpStyle, params.attackStyle),
      shouldRaycastGround,
    })
    this.name = 'enemy'
    this.baseState = baseState
    this.target = target
    this.closeDistance = closeDistance
    this.sightDistance = sightDistance
    this.attackDistance = attackDistance
    this.patrolLength = patrolLength

    this.randomizeAction()
    this.mesh.rotateY(Math.random() * Math.PI * 2)

    if (mapSize) {
      const halfMap = mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
      if (!coords) this.position.set(randFloatSpread(mapSize), 0, randFloatSpread(mapSize))
    }

    if (coords) this.position.copy(coords.next().value)

    this.setState(baseState)
  }

  /* GETTERS */

  get inPursueState() {
    return pursueStates.includes(this.baseState)
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

  get targetNear() {
    if (!this.target) return false
    return this.distancToTarget < this.sightDistance
  }

  get targetSpotted() {
    if (!this.target) return false
    return (this.lookingAtTarget && this.distancToTarget < this.sightDistance)
    || (this.distancToTarget < this.sightDistance * .3) // feel if too close
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

  updateMove(delta, turnAround = true) {
    const direction = this.input.up ? dir.forward : dir.backward
    if (this.directionBlocked(direction))
      if (turnAround) this.turn(Math.PI)
      else this.mesh.translateX(delta * 5)

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
