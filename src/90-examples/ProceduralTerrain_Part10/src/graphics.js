import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js'
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/shaders/FXAAShader.js'
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/postprocessing/EffectComposer.js'

import { material as shaderMaterial } from './scattering-shader.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'

export class Graphics {
  Initialize() {
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

    this._postCamera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)
    const postPlane = new THREE.PlaneBufferGeometry(2, 2)
    const postQuad = new THREE.Mesh(postPlane, shaderMaterial)
    this._postScene = new THREE.Scene()
    this._postScene.add(postQuad)

    scene.add(createSunLight())
  }

  Render() {
    renderer.setRenderTarget(this._target)
    renderer.clear()
    renderer.render(scene, camera)
    renderer.setRenderTarget(null)

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)

    shaderMaterial.uniforms.inverseProjection.value = camera.projectionMatrixInverse
    shaderMaterial.uniforms.inverseView.value = camera.matrixWorld
    shaderMaterial.uniforms.tDiffuse.value = this._target.texture
    shaderMaterial.uniforms.tDepth.value = this._target.depthTexture
    shaderMaterial.uniforms.cameraNear.value = camera.near
    shaderMaterial.uniforms.cameraFar.value = camera.far
    shaderMaterial.uniforms.cameraPosition.value = camera.position
    shaderMaterial.uniforms.cameraForward.value = forward
    shaderMaterial.uniforms.planetPosition.value = new THREE.Vector3(0, 0, 0)
    shaderMaterial.uniformsNeedUpdate = true

    renderer.render(this._postScene, this._postCamera)
  }
}
