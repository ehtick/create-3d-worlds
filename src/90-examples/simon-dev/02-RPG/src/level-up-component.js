import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'

import ParticleSystem from './particle-system.js'
import { Entity } from '../../ecs/entity.js'
import { Component } from '../../ecs/component.js'

class LevelUpComponent extends Component {
  constructor() {
    super()
    this._particles = new ParticleSystem({
      camera,
      parent: scene,
      texture: './assets/textures/ball.png',
    })
    this._particles._alphaSpline.AddPoint(0.0, 0.0)
    this._particles._alphaSpline.AddPoint(0.1, 1.0)
    this._particles._alphaSpline.AddPoint(0.7, 1.0)
    this._particles._alphaSpline.AddPoint(1.0, 0.0)

    this._particles._colourSpline.AddPoint(0.0, new THREE.Color(0x00FF00))
    this._particles._colourSpline.AddPoint(0.5, new THREE.Color(0x40C040))
    this._particles._colourSpline.AddPoint(1.0, new THREE.Color(0xFF4040))

    this._particles._sizeSpline.AddPoint(0.0, 0.05)
    this._particles._sizeSpline.AddPoint(0.5, 0.25)
    this._particles._sizeSpline.AddPoint(1.0, 0.0)
  }

  InitComponent() {
    this._particles.AddParticles(this._parent._position, 300)
  }

  Update(timeElapsed) {
    this._particles.Step(timeElapsed)
    if (this._particles._particles.length == 0)
      this._parent.SetActive(false)
  }
}

export class LevelUpComponentSpawner extends Component {
  Spawn(pos) {
    const e = new Entity()
    e.SetPosition(pos)
    e.AddComponent(new LevelUpComponent())
    this._parent._parent.Add(e)
    return e
  }
};
