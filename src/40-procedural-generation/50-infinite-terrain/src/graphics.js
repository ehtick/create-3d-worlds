import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js'
import { WEBGL } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js'

class Graphics {
  Initialize() {
    if (!WEBGL.isWebGL2Available())
      return false

    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    })
    this._threejs.setPixelRatio(window.devicePixelRatio)
    this._threejs.setSize(window.innerWidth, window.innerHeight)

    const target = document.getElementById('target')
    target.appendChild(this._threejs.domElement)

    const fov = 60
    const aspect = 1920 / 1080
    const near = 1
    const far = 25000.0
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this._camera.position.set(75, 20, 0)

    this._scene = new THREE.Scene()
    this._scene.background = new THREE.Color(0xaaaaaa)

    this._CreateLights()

    return true
  }

  _CreateLights() {
    let light = new THREE.DirectionalLight(0x808080, 1, 100)
    light.position.set(-100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    this._scene.add(light)

    light = new THREE.DirectionalLight(0x404040, 1.5, 100)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    this._scene.add(light)
  }

  get Scene() {
    return this._scene
  }

  get Camera() {
    return this._camera
  }

  Render() {
    this._threejs.render(this._scene, this._camera)
  }
}

export {
  Graphics,
}
