import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { partisanAnimations } from '/data/animations.js'

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'partisan-lowpoly.fbx', angle: Math.PI, animDict: partisanAnimations, prefix: 'character/soldier/', fixColors: true, size: 1.8 })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.25, angle: Math.PI })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict: partisanAnimations, rifle }

export class PartisanLowpolyPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, useJoystick: true, ...props })
  }
}

export class PartisanLowpolyAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, basicState: 'wander', attackDistance: 10, ...props })
  }
}
