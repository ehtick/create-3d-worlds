import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { dupecheshAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'character/ogro/ogro.md2', texture: 'character/ogro/skins/arboshak.png', size: 2, angle: Math.PI * .5, shouldCenter: true, shouldAdjustHeight: true, fixColors: true })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict: dupecheshAnimations }

export class OgroPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class OgroAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
