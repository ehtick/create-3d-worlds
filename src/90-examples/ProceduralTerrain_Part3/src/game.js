import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'

function initLights() {
  let light = new THREE.DirectionalLight(0x808080, 1, 100)
  light.position.set(-100, 100, -100)
  light.target.position.set(0, 0, 0)
  light.castShadow = false
  scene.add(light)

  light = new THREE.DirectionalLight(0x404040, 1.5, 100)
  light.position.set(100, 100, -100)
  light.target.position.set(0, 0, 0)
  light.castShadow = false
  scene.add(light)
}

export class Game {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    camera.position.set(75, 20, 0)
    initLights()
    this._previousRAF = null
    this._minFrameTime = 1.0 / 10.0
    this._entities = {}
    this._OnInitialize()
    this._RAF()
  }

  _RAF() {
    requestAnimationFrame(t => {
      if (this._previousRAF === null)
        this._previousRAF = t

      this._Render(t - this._previousRAF)
      this._previousRAF = t
    })
  }

  _StepEntities(timeInSeconds) {
    for (const k in this._entities)
      this._entities[k].Update(timeInSeconds)
  }

  _Render(timeInMS) {
    const timeInSeconds = Math.min(timeInMS * 0.001, this._minFrameTime)
    this._OnStep(timeInSeconds)
    this._StepEntities(timeInSeconds)
    renderer.render(scene, camera)
    this._RAF()
  }
}
