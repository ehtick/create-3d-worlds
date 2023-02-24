import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'
import { jumpStyles } from '/utils/constants.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', angle: Math.PI, animDict: sorceressAnimations, prefix: 'character/sorceress/', size: 1.75 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, jumpStyle: jumpStyles.FLY_JUMP }

export class SorceressPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class SorceressAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', ...props })
  }
}
