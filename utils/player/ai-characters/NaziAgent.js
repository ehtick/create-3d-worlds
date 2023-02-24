import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { naziAgentAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'nazi-agent.fbx', prefix: 'character/soldier/', animDict: naziAgentAnimations, angle: Math.PI, fixColors: true, size: 1.8 })

const { mesh: pistol } = await loadModel({ file: 'weapon/luger/model.fbx', scale: .18 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, pistol, attackStyle: 'LOOP' }

export class NaziAgentPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class NaziAgentAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
