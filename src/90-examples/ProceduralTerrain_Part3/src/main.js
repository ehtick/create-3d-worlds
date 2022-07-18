import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'

import { FPSControls } from './controls.js'
import { Game } from './game.js'
import { TerrainChunkManager } from './terrain.js'

class ProceduralTerrain_Demo extends Game {
  _OnInitialize() {
    this._userCamera = new THREE.Object3D()
    this._userCamera.position.set(475, 75, 900)

    this._entities._terrain = new TerrainChunkManager(this._userCamera)
    this._entities._controls = new FPSControls(this._userCamera)

    camera.position.copy(this._userCamera.position)
    this._LoadBackground()
  }

  _LoadBackground() {
    scene.background = new THREE.Color(0x000000)
  }

  _OnStep(_) {
    camera.position.copy(this._userCamera.position)
    camera.quaternion.copy(this._userCamera.quaternion)
  }
}

new ProceduralTerrain_Demo()