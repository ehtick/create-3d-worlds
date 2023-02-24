import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const germanSoldierProneAnimations = {
  idle: 'Prone Idle',
  walk: 'Prone Forward',
  attack: 'Prone Firing Rifle',
  death: 'Prone Death',
}

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'german-soldier.fbx', angle: Math.PI, animDict: germanSoldierProneAnimations, prefix: 'character/soldier/', fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class GermanSoldierPronePlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GermanSoldierProneAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
