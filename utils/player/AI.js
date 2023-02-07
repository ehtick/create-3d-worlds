import { clone } from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { Keyboard } from '/utils/classes/Keyboard.js'
import Player from './Player.js'
import { getAIState } from './states/index.js'

export default class AI extends Player {
  constructor({ jumpStyle = 'JUMP', ...params } = {}) {
    super({ ...params, mesh: clone(params.mesh), keyboard: new Keyboard(false), speed: 0, getState: name => getAIState(name, jumpStyle) })
    this.randomizeAction()
    this.maxSpeed = .03
  }
}
