import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { trollAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', angle: Math.PI, animDict: trollAnimations, prefix: 'character/troll/', fixColors: true, size: 3 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class TrollPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class TrollAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
