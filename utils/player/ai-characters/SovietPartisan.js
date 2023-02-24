import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { sovietPartisanAnimations } from '/data/animations.js'

/* LOADERS */

export const loadSovietPartisan = () => loadModel({ file: 'soviet-partisan.fbx', prefix: 'character/soldier/', animDict: sovietPartisanAnimations, angle: Math.PI, size: 1.8, fixColors: true })

/* LOADING */

const { mesh, animations, animDict } = await loadSovietPartisan()

const { mesh: rifle } = await loadModel({ file: 'weapon/mg-42/model.fbx', scale: .4 })

/* EXTENDED CLASSES */

export class SovietPartisanPlayer extends Player {
  constructor() {
    super({ mesh, animations, animDict, rifle, attackStyle: 'LOOP' })
  }
}

export class SovietPartisanAI extends AI {
  constructor({ solids, target, coords } = {}) {
    super({ mesh, animations, animDict, rifle, basicState: 'wander', solids, target, attackStyle: 'LOOP', coords })
  }
}
