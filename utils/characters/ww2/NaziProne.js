import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const animDict = {
  idle: 'Prone Idle',
  walk: 'Prone Forward',
  attack: 'Prone Firing Rifle',
  special: 'Throw Grenade',
  death: 'Prone Death',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'nazi.fbx', animDict, prefix: 'character/nazi/', angle: Math.PI, fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class NaziPronePlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class NaziProneAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 10, ...props })
  }
}
