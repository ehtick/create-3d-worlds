import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { skeletonAnimation } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/skeleton/', angle: Math.PI, animDict: skeletonAnimation })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, speed: 1.2 }

export class SkeletonPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class SkeletonAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
