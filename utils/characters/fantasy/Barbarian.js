import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const animDict = {
  idle: 'Unarmed Idle',
  walk: 'Dwarf Walk',
  run: 'Running',
  jump: 'Jumping',
  attack: 'Mma Kick',
  attack2: 'Standing Melee Kick',
  special: 'Standing 2H Magic Attack 05',
  pain: 'Standing React Large From Right',
  wounded: 'Zombie Crawl',
  death: 'Falling Back Death',
}

/* LOADING */

const { mesh, animations } = await loadModel({ prefix: 'character/barbarian/', file: 'model.fbx', angle: Math.PI, fixColors: true, animDict })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, jumpStyle: 'FLY_JUMP', maxJumpTime: 12 }

export class BarbarianPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class BarbarianAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}
