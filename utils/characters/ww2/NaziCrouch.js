import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const naziCrouchAnimations = {
  idle: 'Crouch Idle',
  walk: 'Crouched Run',
  attack: 'Fire Rifle Crouch',
  death: 'Crouch Death',
}

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'nazi.fbx', animDict: naziCrouchAnimations, prefix: 'character/nazi/', angle: Math.PI, fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class NaziCrouchPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class NaziCrouchAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
