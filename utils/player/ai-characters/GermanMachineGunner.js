import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { germanMachineGunnerAnimations } from '/data/animations.js'

/* LOADERS */

const loadGermanMachineGunner = () => loadModel({ file: 'german-machine-gunner.fbx', animDict: germanMachineGunnerAnimations, prefix: 'character/soldier/', angle: Math.PI, fixColors: true })

/* LOADING */

const { mesh, animations, animDict } = await loadGermanMachineGunner()

const { mesh: rifle } = await loadModel({ file: 'weapon/mg-42/lowpoly.fbx', scale: 1.4 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle, attackStyle: 'LOOP' }

export class GermanMachineGunnerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GermanMachineGunnerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
