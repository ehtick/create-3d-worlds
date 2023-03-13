import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

export const animDict = {
  idle: 'Rifle Idle',
  walk: 'Walking', // Rifle Walk
  run: 'Rifle Run',
  jump: 'Jump Forward',
  attack: 'Firing Rifle',
  attack2: 'Fire Rifle Crouch',
  special: 'Toss Grenade',
  pain: 'Reaction',
  death: 'Dying',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'partisan.fbx', angle: Math.PI, animDict, prefix: 'character/soldier/', fixColors: true, size: 1.8 })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle-berthier/model.fbx', scale: .60, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class PartisanPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class PartisanAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 10, ...props })
  }
}
