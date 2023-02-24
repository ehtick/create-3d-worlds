import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { germanSoldierCrouchAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'german-soldier.fbx', angle: Math.PI, animDict: germanSoldierCrouchAnimations, prefix: 'character/soldier/', size: 1.8, fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle }

export class GermanSoldierCrouchPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GermanSoldierCrouchAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
