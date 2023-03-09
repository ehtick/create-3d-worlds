import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import Particles from '/utils/classes/Particles.js'

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

const sharedProps = { mesh, animations, animDict, rifle, speed: 1.8, attackStyle: 'LOOP', attackDistance: 9 }

const createFlame = () => {
  const particles = new Particles({ file: 'fire.png', size: 5, num: 50, minRadius: 0, maxRadius: .5, color: 0xffffff })
  particles.mesh.rotateX(Math.PI)
  particles.mesh.visible = false
  particles.mesh.translateY(-1.2)
  return particles
}

export class GermanFlameThrowerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.particles = createFlame()
    this.add(this.particles.mesh)
  }

  attackUpdate() {
    this.particles.mesh.visible = true
    this.particles.update({ min: 1.5, max: this.attackDistance, axis: 2, minVelocity: .1, maxVelocity: .2 })
  }
}

export class GermanFlameThrowerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, attackDistance: 14, ...props })
    this.particles = createFlame()
    this.add(this.particles.mesh)
  }

  attackUpdate(delta) {
    this.particles.addParticles(delta)
  }
}
