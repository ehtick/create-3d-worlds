import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const orcOgreAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Mutant Walking',
  run: 'Mutant Run',
  attack: 'Mutant Swiping',
  attack2: 'Zombie Attack',
  special: 'Zombie Scream',
  death: 'Zombie Dying',
}

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/orc-ogre/', animDict: orcOgreAnimations, angle: Math.PI, fixColors: true })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class OrcOgrePlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class OrcOgreAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
