import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { demonAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/demon/', animDict: demonAnimations, angle: Math.PI, fixColors: true, size: 3 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class DemonPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class DemonAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
