import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

export const animDict = {
  idle: 'Dwarf Idle',
  walk: 'Pistol Walk',
  run: 'Pistol Run',
  attack: 'Shooting',
  special: 'Yelling',
  pain: 'Hit Reaction Pistol',
  death: 'Standing React Death Backward',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'nazi-officer.fbx', prefix: 'character/soldier/', animDict, angle: Math.PI, fixColors: true, size: 2 })

const { mesh: pistol } = await loadModel({ file: 'weapon/luger/model.fbx', scale: .18 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, pistol, speed: 1.9 }

export class NaziOfficerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.mesh.translateY(.1)
  }
}

export class NaziOfficerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 7, ...props })
    this.mesh.translateY(.1)
  }

  lookAtTarget() {
    super.lookAtTarget()
    this.mesh.rotateY(Math.PI / 16)
  }
}
