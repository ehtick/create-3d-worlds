import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js'
import { WEBGL } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/WebGL.js'
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/shaders/FXAAShader.js'
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/EffectComposer.js'

import { scattering_shader } from './scattering-shader.js'
import { scene, camera, renderer } from '/utils/scene.js'

export class Graphics {
  Initialize() {
    if (!WEBGL.isWebGL2Available())
      return false

    const renderPass = new RenderPass(scene, camera)
    const fxaaPass = new ShaderPass(FXAAShader)

    this.composer_ = new EffectComposer(renderer)
    this.composer_.addPass(renderPass)
    this.composer_.addPass(fxaaPass)

    const params = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      generateMipmaps: false,
    }

    this._target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, params)
    this._target.stencilBuffer = false
    this._target.depthBuffer = true
    this._target.depthTexture = new THREE.DepthTexture()
    this._target.depthTexture.format = THREE.DepthFormat
    this._target.depthTexture.type = THREE.FloatType
    this._target.outputEncoding = THREE.LinearEncoding

    renderer.setRenderTarget(this._target)

    const logDepthBufFC = 2.0 / (Math.log(camera.far + 1.0) / Math.LN2)

    this._postCamera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)
    this._depthPass = new THREE.ShaderMaterial({
      vertexShader: scattering_shader.VS,
      fragmentShader: scattering_shader.PS,
      uniforms: {
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        cameraPosition: { value: camera.position },
        cameraForward: { value: null },
        tDiffuse: { value: null },
        tDepth: { value: null },
        inverseProjection: { value: null },
        inverseView: { value: null },
        planetPosition: { value: null },
        planetRadius: { value: null },
        atmosphereRadius: { value: null },
        logDepthBufFC: { value: logDepthBufFC },
      }
    })
    const postPlane = new THREE.PlaneBufferGeometry(2, 2)
    const postQuad = new THREE.Mesh(postPlane, this._depthPass)
    this._postScene = new THREE.Scene()
    this._postScene.add(postQuad)

    this._CreateLights()

    return true
  }

  _CreateLights() {
    let light = new THREE.DirectionalLight(0xFFFFFF, 1)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)

    light = new THREE.DirectionalLight(0x404040, 1)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)

    light = new THREE.DirectionalLight(0x404040, 1)
    light.position.set(100, 100, -100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)

    light = new THREE.DirectionalLight(0x202040, 1)
    light.position.set(100, -100, 100)
    light.target.position.set(0, 0, 0)
    light.castShadow = false
    scene.add(light)

    light = new THREE.AmbientLight(0xFFFFFF, 1.0)
    scene.add(light)
  }

  Render() {
    renderer.setRenderTarget(this._target)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)

    this._depthPass.uniforms.inverseProjection.value = camera.projectionMatrixInverse
    this._depthPass.uniforms.inverseView.value = camera.matrixWorld
    this._depthPass.uniforms.tDiffuse.value = this._target.texture
    this._depthPass.uniforms.tDepth.value = this._target.depthTexture
    this._depthPass.uniforms.cameraNear.value = camera.near
    this._depthPass.uniforms.cameraFar.value = camera.far
    this._depthPass.uniforms.cameraPosition.value = camera.position
    this._depthPass.uniforms.cameraForward.value = forward
    this._depthPass.uniforms.planetPosition.value = new THREE.Vector3(0, 0, 0)
    this._depthPass.uniformsNeedUpdate = true

    renderer.render(this._postScene, this._postCamera)
  }
}
