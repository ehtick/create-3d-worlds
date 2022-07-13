// https://github.com/simondevyoutube/ProceduralTerrain_Part3

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js'
import { Game } from './game.js'
import { TerrainChunkManager } from './terrain.js'

class ProceduralTerrain_Demo extends Game {
  _OnInitialize() {
    this._userCamera = new THREE.Object3D()
    this._userCamera.position.set(475, 75, 900)

    this._entities._terrain = new TerrainChunkManager({
      camera: this._userCamera,
      scene: this._graphics.Scene,
    })

    this._graphics.Camera.position.copy(this._userCamera.position)
    this._LoadBackground()
  }

  _LoadBackground() {
    this._graphics.Scene.background = new THREE.Color(0x000000)
  }

  _OnStep(_) {
    this._graphics._camera.position.copy(this._userCamera.position)
    this._graphics._camera.quaternion.copy(this._userCamera.quaternion)
  }
}

new ProceduralTerrain_Demo()
