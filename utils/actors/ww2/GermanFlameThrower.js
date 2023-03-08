import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import Thrust from '/utils/classes/Thrust.js'

const animDict = {
  idle: 'Machine Gun Idle',
  walk: 'Machine Gun Walk',
  run: 'Rifle Run',
  attack: 'Crouch Rapid Fire',
  attack2: 'Machine Gun Idle',
  pain: 'Hit Reaction',
  death: 'Crouch Death',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'german-machine-gunner.fbx', animDict, prefix: 'character/soldier/', angle: Math.PI, fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/flame-gun/model.fbx', scale: .75 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle, speed: 1.8, attackStyle: 'LOOP' }

export class GermanFlameThrowerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.thrust = new Thrust()
    this.thrust.mesh.translateY(1)
    this.thrust.mesh.rotation.x = Math.PI * .5
    this.add(this.thrust.mesh)
  }

  attackUpdate(delta) {
    this.thrust.addParticles(delta)
  }

  update(delta) {
    super.update(delta)
    this.thrust.updateParticles(delta)
  }
}


export class GermanFlameThrowerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 14, ...props })
    this.thrust = new Thrust()
    this.thrust.mesh.translateY(1)
    this.thrust.mesh.rotation.x = Math.PI * .5
    this.add(this.thrust.mesh)
  }

  attackUpdate(delta) {
    this.thrust.addParticles(delta)
  }

  update(delta) {
    super.update(delta)
    this.thrust.updateParticles(delta)
  }
}
