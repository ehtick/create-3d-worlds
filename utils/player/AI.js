import { Vector3, MathUtils } from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

import { Input } from '/utils/classes/Input.js'
import Actor from './Actor.js'
import { getAIState } from './states/index.js'
import { jumpStyles, attackStyles, baseAiStates, pursueStates, reactions } from '/utils/constants.js'

const { randFloatSpread } = MathUtils

const walkAnims = ['wander', 'follow', 'patrol']
const runAnims = ['pursue', 'flee']

export default class AI extends Actor {
  constructor({
    jumpStyle = jumpStyles.FALSE_JUMP,
    attackStyle = attackStyles.LOOP,
    baseState = baseAiStates.wander,
    speed = 1.8,
    shouldRaycastGround = false,
    sightDistance = 25,
    followDistance = 1.5,
    attackDistance = 1,
    patrolDistance = 10,
    target,
    ...params
  } = {}) {
    super({
      ...params,
      input: new Input(false),
      getState: name => getAIState(name, jumpStyle, attackStyle),
      shouldRaycastGround,
    })
    this.name = 'enemy'
    this.baseState = baseState
    this.target = target
    this.followDistance = followDistance
    this.sightDistance = sightDistance
    this.attackDistance = attackDistance
    this.patrolDistance = patrolDistance
    this.speed = speed

    this.randomizeAction()
    this.mesh.rotateY(Math.random() * Math.PI * 2)

    if (params.mapSize && !params.coords)
      this.position.set(randFloatSpread(params.mapSize), 0, randFloatSpread(params.mapSize))

    this.setState(baseState)
  }

  /* GETTERS */

  get inPursueState() {
    return pursueStates.includes(this.baseState)
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

  get targetInRange() {
    if (!this.target) return false
    return this.distancToTarget < this.sightDistance
  }

  get targetAbove() {
    return this.target.position.y >= this.position.y + this.height * .5
  }

  get targetSpotted() {
    if (!this.target) return false
    if (this.targetAbove) return false
    return (this.targetInRange && this.lookingAtTarget) || (this.targetInRange * .3) // feel if too close
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

  turnSmooth(angle = Math.PI) {
    new TWEEN.Tween(this.mesh.rotation)
      .to({ y: this.mesh.rotation.y + angle }, 500)
      .start()
  }

  /* ANIMS */

  setupMixer(animations, animDict) {
    const { actions } = this
    super.setupMixer(animations, animDict)
    walkAnims.forEach(name => {
      if (!actions[name]) actions[name] = actions.walk
    })
    runAnims.forEach(name => {
      if (!actions[name]) actions[name] = actions.run
    })
  }

  randomizeAction() {
    if (!this.action) return
    this.action.time = Math.random() * this.action.getClip().duration
  }

  /* UPDATE */

  updateMove(delta, reaction = reactions.BOUNCE) {
    super.updateMove(delta, reaction)
  }

  update(delta) {
    super.update(delta)
    TWEEN.update()
  }
}
