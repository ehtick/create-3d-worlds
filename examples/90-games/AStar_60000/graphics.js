import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js'
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/stats.module.js'
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/RenderPass.js'

export class Graphics {
  Initialize() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    const target = document.getElementById('target')
    target.appendChild(this.renderer.domElement)

    this._stats = new Stats()
    target.appendChild(this._stats.dom)

    window.addEventListener('resize', () => {
      this._OnWindowResize()
    }, false)

    const fov = 60
    const aspect = 1920 / 1080
    const near = 1.0
    const far = 1000.0
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    this.camera.position.set(16, 2, 0)

    this.scene = new THREE.Scene()

    this._CreateLights()

    const composer = new EffectComposer(this.renderer)
    this._composer = composer
    this._composer.addPass(new RenderPass(this.scene, this.camera))

    return true
  }

  _CreateLights() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1, 100)
    light.position.set(10, 20, 10)
    // light.target.position.set(0, 0, 0);
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
    this.scene.add(light)
    // cleanup
    this._shadowLight = light

    light = new THREE.DirectionalLight(0x404040, 1, 100)
    light.position.set(-100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    this.scene.add(light)

    light = new THREE.DirectionalLight(0x404040, 1, 100)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    this.scene.add(light)
  }

  AddPostFX(passClass, params) {
    const pass = new passClass(this.scene, this.camera)
    for (const k in params)
      pass[k] = params[k]

    this._composer.addPass(pass)
    return pass
  }

  _OnWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this._composer.setSize(window.innerWidth, window.innerHeight)
  }

  get Scene() {
    return this.scene
  }

  Render(timeInSeconds) {
    this._composer.render()
    this._stats.update()
  }
}
