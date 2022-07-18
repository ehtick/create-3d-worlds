import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js'
import { controls } from './controls.js'
import { Graphics } from './graphics.js'
import { TerrainChunkManager } from './terrain.js'
import { scene, camera } from '/utils/scene.js'

class ProceduralTerrain_Demo {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this.graphics_ = new Graphics(this)
    this.graphics_.Initialize()
    this._previousRAF = null
    this._minFrameTime = 1.0 / 10.0
    this._entities = {}

    this._OnInitialize()
    this._RAF()
  }

  _DisplayError(errorText) {
    const error = document.getElementById('error')
    error.innerText = errorText
  }

  _RAF() {
    requestAnimationFrame(t => {
      if (this._previousRAF === null)
        this._previousRAF = t

      this._Render(t - this._previousRAF)
      this._previousRAF = t
    })
  }

  _AddEntity(name, entity, priority) {
    this._entities[name] = { entity, priority }
  }

  _StepEntities(timeInSeconds) {
    const sortedEntities = Object.values(this._entities)

    sortedEntities.sort((a, b) => a.priority - b.priority)

    for (const s of sortedEntities)
      s.entity.Update(timeInSeconds)

  }

  _Render(timeInMS) {
    const timeInSeconds = Math.min(timeInMS * 0.001, this._minFrameTime)

    this._OnStep(timeInSeconds)
    this._StepEntities(timeInSeconds)
    this.graphics_.Render(timeInSeconds)

    this._RAF()
  }

  _OnInitialize() {
    camera.position.set(357183, -19402, -182320)
    camera.quaternion.set(0.251, 0.699, -0.48248, 0.4629)

    this._AddEntity('_terrain', new TerrainChunkManager(), 1.0)
    this._AddEntity('_controls', new controls.FPSControls(), 0.0)

    this._totalTime = 0
    this._LoadBackground()
  }

  _LoadBackground() {
    scene.background = new THREE.Color(0x000000)
    const loader = new THREE.CubeTextureLoader()
    const texture = loader.load([
      './resources/space-posx.jpg',
      './resources/space-negx.jpg',
      './resources/space-posy.jpg',
      './resources/space-negy.jpg',
      './resources/space-posz.jpg',
      './resources/space-negz.jpg',
    ])
    texture.encoding = THREE.sRGBEncoding
    scene.background = texture
  }

  _OnStep() { }
}

new ProceduralTerrain_Demo()
