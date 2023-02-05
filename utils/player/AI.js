import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'

export default class AI extends Player {
  constructor(params) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), force: 0 })
    this.randomizeAction()
    this.maxSpeed = .03
  }
}
