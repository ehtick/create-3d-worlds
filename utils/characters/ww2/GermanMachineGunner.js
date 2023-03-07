import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import Thrust from '/utils/classes/Thrust.js'

const animDict = {
  idle: 'Machine Gun Idle',
  walk: 'Machine Gun Walk',
  run: 'Rifle Run',
  attack: 'Crouch Rapid Fire',
  pain: 'Hit Reaction',
  death: 'Crouch Death',
}

/* LOADING */

const { mesh, animations } = await loadModel({ file: 'german-machine-gunner.fbx', animDict, prefix: 'character/soldier/', angle: Math.PI, fixColors: true })

const { mesh: rifle } = await loadModel({ file: 'weapon/mg-42/lowpoly.fbx', scale: 1.4 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, animations, animDict, rifle, speed: 1.8, attackStyle: 'LOOP' }

export class GermanMachineGunnerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class GermanMachineGunnerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 14, ...props })
    this.thrust = new Thrust()
    this.thrust.mesh.translateY(1)
    this.thrust.mesh.rotation.x = Math.PI * .5
    this.add(this.thrust.mesh)
  }

  fire(dt) {
    this.thrust.clear()
  }

  update(delta) {
    super.update(delta)
    // this.thrust.update(delta)
  }
}
