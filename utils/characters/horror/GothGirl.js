import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { zombieDocAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'goth-girl.fbx', prefix: 'character/zombie/', angle: Math.PI, fixColors: true, animDict: zombieDocAnimations })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict }

export class GothGirlPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GothGirlAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', ...props })
  }
}
