import { Box3, Vector3 } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import Player from './Player.js'
import { Keyboard } from '/utils/classes/Keyboard.js'
import { SteeringEntity } from '/libs/ThreeSteer.js'

/* NPC, bridge between Player and SteeringEntity.
* Player does not move, only play animation via keyboard input
* SteeringEntity controls move
*/
export default class NPC extends Player {
  constructor(params) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), speed: 0 })
    this.entity = new SteeringEntity(this.mesh)
    this.randomizeAction()

    if (params.mapSize) {
      const halfMap = params.mapSize / 2
      this.boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))
    }
  }

  get position() {
    return this.entity.position
  }

  set maxSpeed(value) {
    this.entity.maxSpeed = value
  }

  followLeader(leader, entities, { distance = 2, separationRadius = 2, maxSeparation = 4, leaderSightRadius = 4, arrivalThreshold = 2 } = {}) {
    this. entity.followLeader(leader, entities, distance, separationRadius, maxSeparation, leaderSightRadius, arrivalThreshold)
    this.keyboard.pressed.KeyW = true

    this.entity.lookWhereGoing(true)
    if (this.boundaries) this.entity.bounce(this.boundaries)
    this.entity.update()
  }

  wander() {
    this.entity.wander()

    this.entity.lookWhereGoing(true)
    if (this.boundaries) this.entity.bounce(this.boundaries)
    this.entity.update()
  }
}
