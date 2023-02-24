import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const animDict = {
  idle: 'Rifle Aiming Idle',
  attack: 'Firing Rifle',
  walk: 'Walk With Rifle',
  pain: 'Hit Reaction',
  death: 'Death Crouching Headshot Front',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'nazi.fbx', animDict, prefix: 'character/nazi/', angle: Math.PI, fixColors: true, size: 1.8 })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class NaziPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class NaziAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
