import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

export const animDict = {
  idle: 'Dwarf Idle',
  walk: 'Pistol Walk',
  attack: 'Shooting',
  special: 'Yelling',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'nazi-officer.fbx', prefix: 'character/nazi/', animDict, angle: Math.PI, fixColors: true, size: 2 })

const { mesh: pistol } = await loadModel({ file: 'weapon/luger/model.fbx', scale: .18 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, pistol }

export class NaziOfficerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class NaziOfficerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 10, ...props })
  }
}
