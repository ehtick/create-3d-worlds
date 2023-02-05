import { Box3, Vector3, MathUtils } from 'three'
import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import Player from './Player.js'
import { Keyboard } from '/utils/classes/Keyboard.js'
import { SteeringEntity } from '/libs/ThreeSteer.js'

const { randFloatSpread } = MathUtils

/*
 * NPC class, bridge between Player and SteeringEntity.
 * Player does not move, only play animation via keyboard input
 * SteeringEntity controls move
*/
export default class NPC extends Player {
  constructor(params) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), force: 0 })
    this.entity = new SteeringEntity(this.mesh)
    this.randomizeAction()
    this.maxSpeed = .03

    const { mapSize } = params
    if (mapSize) {
      this.position.set(randFloatSpread(mapSize), -.5, randFloatSpread(mapSize))
      const halfMap = mapSize / 2
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
  }

  force() {
    this.entity.wander()
    this.entity.lookWhereGoing(true)
  }

  seek(mesh) {
    if (this.position.distanceTo(mesh.position) > 1) {
      this.entity.seek(mesh.position)
      this.entity.lookWhereGoing(true)
    } else
      this.entity.idle()
  }

  update(delta) {
    super.update(delta) // update animation
    if (this.boundaries) this.entity.bounce(this.boundaries)
    this.entity.update() // update move
  }
}
