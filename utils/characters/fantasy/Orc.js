import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const orcAnimations = {
  idle: 'Unarmed Idle',
  walk: 'Orc Walk',
  attack: 'Zombie Attack',
  attack2: 'Zombie Kicking',
  special: 'Zombie Scream',
  death: 'Death From The Back',
}

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/orc/', animDict: orcAnimations, angle: Math.PI, fixColors: true })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class OrcPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class OrcAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', ...props })
  }
}
