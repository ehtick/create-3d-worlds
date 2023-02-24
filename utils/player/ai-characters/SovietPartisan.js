import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { sovietPartisanAnimations } from '/data/animations.js'

/* LOADER */

export const loadSovietPartisan = () => loadModel({ file: 'soviet-partisan.fbx', prefix: 'character/soldier/', animDict: sovietPartisanAnimations, angle: Math.PI, size: 1.8, fixColors: true })

/* AI CLASS */

const { mesh, animations, animDict } = await loadSovietPartisan()

export default class SovietPartisan extends AI {
  constructor({ solids, target, coords } = {}) {
    super({ mesh, animations, animDict, basicState: 'wander', solids, target, attackStyle: 'LOOP', coords })
  }
}