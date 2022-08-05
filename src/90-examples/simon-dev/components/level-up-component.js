import * as THREE from '/node_modules/three/build/three.module.js'

import { ParticleSystem } from './particle-system.js'
import { Entity } from '../ecs/entity.js'
import { Component } from '../ecs/component.js'

class LevelUpComponent extends Component {
  constructor() {
    super()
    this.particles = new ParticleSystem({
      texture: '/assets/simon-dev/textures/ball.png',
    })
    this.particles.alphaSpline.AddPoint(0.0, 0.0)
    this.particles.alphaSpline.AddPoint(0.1, 1.0)
    this.particles.alphaSpline.AddPoint(0.7, 1.0)
    this.particles.alphaSpline.AddPoint(1.0, 0.0)

    this.particles.colourSpline.AddPoint(0.0, new THREE.Color(0x00FF00))
    this.particles.colourSpline.AddPoint(0.5, new THREE.Color(0x40C040))
    this.particles.colourSpline.AddPoint(1.0, new THREE.Color(0xFF4040))

    this.particles.sizeSpline.AddPoint(0.0, 0.05)
    this.particles.sizeSpline.AddPoint(0.5, 0.25)
    this.particles.sizeSpline.AddPoint(1.0, 0.0)
  }

  InitComponent() {
    this.particles.AddParticles(this.Parent.Position, 300)
  }

  Update(timeElapsed) {
    this.particles.Step(timeElapsed)
    if (this.particles.particles.length == 0)
      this.Parent.SetActive(false)
  }
}

export class LevelUpComponentSpawner extends Component {
  Spawn(pos) {
    const e = new Entity()
    e.SetPosition(pos)
    e.AddComponent(new LevelUpComponent())
    this.Manager.Add(e)
    return e
  }
}