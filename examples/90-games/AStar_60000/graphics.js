import * as THREE from 'three'
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/stats.module.js'
import { scene, camera, renderer } from '/utils/scene.js'

export class Graphics {
  Initialize() {
    this._stats = new Stats()
    document.body.appendChild(this._stats.dom)
    camera.position.set(16, 2, 0)
    this._CreateLights()
  }

  _CreateLights() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1, 100)
    light.position.set(10, 20, 10)
    light.castShadow = true
    light.shadow.bias = -0.005
    light.shadow.mapSize.set(4096, 4096)
    light.shadow.camera.near = 0.01
    light.shadow.camera.far = 50
    light.shadow.camera.left = 50
    light.shadow.camera.right = -50
    light.shadow.camera.top = 50
    light.shadow.camera.bottom = -50
    light.shadow.radius = 1
    scene.add(light)
    // cleanup
    this._shadowLight = light

    light = new THREE.DirectionalLight(0x404040, 1, 100)
    light.position.set(-100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)

    light = new THREE.DirectionalLight(0x404040, 1, 100)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)
  }

  get Scene() {
    return scene
  }

  Render(timeInSeconds) {
    renderer.render(scene, camera)
    this._stats.update()
  }
}
