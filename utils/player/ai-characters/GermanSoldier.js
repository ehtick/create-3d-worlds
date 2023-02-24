import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel, loadRifle } from '/utils/loaders.js'
import { germanSoldierAnimations } from '/data/animations.js'

/* LOADERS */

const loadGermanSoldier = () => loadModel({ file: 'german-soldier.fbx', angle: Math.PI, animDict: germanSoldierAnimations, prefix: 'character/soldier/', size: 1.8, fixColors: true })

/* LOADING */

const { mesh, animations, animDict } = await loadGermanSoldier()
const { mesh: rifle } = await loadRifle()

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle, attackStyle: 'LOOP' }

export class GermanSoldierPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GermanSoldierAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
