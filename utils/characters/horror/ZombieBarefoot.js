import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { zombieBarefootAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations, animDict } = await loadModel({ file: 'zombie-barefoot.fbx', prefix: 'character/zombie/', angle: Math.PI, fixColors: true, animDict: zombieBarefootAnimations })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, speed: .5 }

export class ZombieBarefootPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class ZombieBarefootAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
