import Player from './Player.js'
import { Keyboard } from '/utils/classes/Keyboard.js'
import { SteeringEntity } from '/libs/ThreeSteer.js'

export default class NPC extends Player {
  constructor(params = {}) {
    super({ keyboard: new Keyboard(false), speed: 0, ...params })
    this.entity = new SteeringEntity(params.mesh)
  }

  get position() {
    return this.entity.position
  }

}
