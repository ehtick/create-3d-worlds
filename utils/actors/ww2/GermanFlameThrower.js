import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { FlameThrower } from '/utils/classes/Particles.js'

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

const sharedProps = { mesh, animations, animDict, rifle, speed: 1.8, attackStyle: 'LOOP', attackDistance: 7 }

export class GermanFlameThrowerPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.particles = new FlameThrower()
    this.particles.mesh.material.opacity = 0
    this.particles.mesh.raycast = false
    this.add(this.particles.mesh)
  }

  startAttack() {
    super.startAttack()
    this.particles.mesh.material.opacity = 1
    this.shouldFadeOut = false
  }

  endAttack() {
    this.shouldFadeOut = true
  }

  update(delta) {
    super.update(delta)
    if (this.particles.mesh.material.opacity <= 0) return

    this.particles.update({ max: this.attackDistance, loop: !this.shouldFadeOut })

    if (this.shouldFadeOut)
      this.particles.mesh.material.opacity -= .06
  }
}

export class GermanFlameThrowerAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.particles = new FlameThrower()
    this.particles.mesh.material.opacity = 0
    this.add(this.particles.mesh)
  }

  startAttack() {
    super.startAttack()
    this.particles.mesh.material.opacity = 1
    this.shouldFadeOut = false
  }

  endAttack() {
    this.shouldFadeOut = true
  }

  update(delta) {
    super.update(delta)
    if (this.particles.mesh.material.opacity <= 0) return

    this.particles.update({ max: this.attackDistance, loop: !this.shouldFadeOut })

    if (this.shouldFadeOut)
      this.particles.mesh.material.opacity -= .06
  }
}
