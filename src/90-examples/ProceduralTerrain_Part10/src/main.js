import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js'
import { controls } from './controls.js'
import { Game } from './game.js'
import { terrain } from './terrain.js'
import { scene, camera, renderer } from '/utils/scene.js'

class ProceduralTerrain_Demo extends Game {

  _OnInitialize() {
    camera.position.set(357183, -19402, -182320)
    camera.quaternion.set(0.251, 0.699, -0.48248, 0.4629)

    this._AddEntity('_terrain', new terrain.TerrainChunkManager({
      camera,
      scene,
      game: this,
    }), 1.0)

    this._AddEntity('_controls', new controls.FPSControls({
      camera,
      scene,
      domElement: renderer.domElement,
    }), 0.0)

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

  _OnStep(timeInSeconds) { }
}

new ProceduralTerrain_Demo()
