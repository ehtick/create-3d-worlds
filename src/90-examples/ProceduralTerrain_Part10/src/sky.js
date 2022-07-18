import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js'

import { Sky } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/objects/Sky.js'
import { Water } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/objects/Water.js'

export const sky = (function() {

  class TerrainSky {
    constructor(params) {
      this._params = params
      this._Init(params)
    }

    _Init(params) {
      const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100)

      this._water = new Water(
        waterGeometry,
        {
          textureWidth: 2048,
          textureHeight: 2048,
          waterNormals: new THREE.TextureLoader().load('resources/waternormals.jpg', texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
          }),
          alpha: 0.5,
          sunDirection: new THREE.Vector3(1, 0, 0),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 0.0,
          fog: undefined
        }
      )
      // this._water.rotation.x = - Math.PI / 2;
      // this._water.position.y = 4;

      this._sky = new Sky()
      this._sky.scale.setScalar(10000)

      this._group = new THREE.Group()
      // this._group.add(this._water);
      this._group.add(this._sky)
      params.scene.add(this._group)
    }

    Update(timeInSeconds) {
      this._water.material.uniforms.time.value += timeInSeconds

      this._group.position.x = this._params.camera.position.x
      this._group.position.z = this._params.camera.position.z
    }
  }

  return {
    TerrainSky
  }
})()
