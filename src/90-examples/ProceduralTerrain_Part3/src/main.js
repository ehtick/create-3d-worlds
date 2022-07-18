import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'

import { controls } from './controls.js'
import { game } from './game.js'
import { terrain } from './terrain.js'

class ProceduralTerrain_Demo extends game.Game {
  _OnInitialize() {
    this._userCamera = new THREE.Object3D()
    this._userCamera.position.set(475, 75, 900)

    this._entities._terrain = new terrain.TerrainChunkManager({
      camera: this._userCamera,
      scene,
    })

    this._entities._controls = new controls.FPSControls(
      {
        scene,
        camera: this._userCamera
      })

    this._graphics.Camera.position.copy(this._userCamera.position)

    this._LoadBackground()
  }

  _LoadBackground() {
    this._graphics.Scene.background = new THREE.Color(0x000000)
  }

  _OnStep(_) {
    camera.position.copy(this._userCamera.position)
    camera.quaternion.copy(this._userCamera.quaternion)
  }
}

new ProceduralTerrain_Demo()