import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

const goblinAnimations = {
  idle: 'Great Sword Idle',
  walk: 'Great Sword Walk',
  attack: 'Great Sword Slash',
  death: 'Two Handed Sword Death',
}

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', angle: Math.PI, animDict: goblinAnimations, prefix: 'character/goblin/', fixColors: true, size: 1.5 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class GoblinPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GoblinAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
