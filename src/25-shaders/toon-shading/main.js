/* global THREE */
import { vertexShader, cartoonFragmentShader, outlineFragmentShader } from './shader.js'

const scene = new THREE.Scene()
const objectScene = new THREE.Scene()

const objectCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
objectCamera.position.set(0, 200, 200)

const camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

new THREE.OrbitControls(objectCamera, renderer.domElement)

const light = new THREE.DirectionalLight(0xffffff, 0.7)
light.position.set(-1, 0.4, 0.5)
objectScene.add(light)

const depthMaterial = new THREE.MeshDepthMaterial()
const normalMaterial = new THREE.MeshNormalMaterial()
const outlineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    depthTexture: {
      value: null
    },
    normalTexture: {
      value: null
    },
    sceneTexture: {
      value: null
    }
  },
  vertexShader,
  fragmentShader: outlineFragmentShader
})

const depthTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

const normalTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

const sceneTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

outlineMaterial.uniforms.depthTexture.value = depthTexture.texture
outlineMaterial.uniforms.normalTexture.value = normalTexture.texture
outlineMaterial.uniforms.sceneTexture.value = sceneTexture.texture

const teapotGeometry = new THREE.TeapotBufferGeometry()

const cartoonMaterial = new THREE.ShaderMaterial({
  lights: true,
  uniforms: Object.assign(
    THREE.UniformsLib.common,
    THREE.UniformsLib.lights),
  vertexShader,
  fragmentShader: cartoonFragmentShader
})

const mesh = new THREE.Mesh(teapotGeometry, cartoonMaterial)
objectScene.add(mesh)

const screenPlane = new THREE.PlaneBufferGeometry(2, 2)
scene.add(new THREE.Mesh(screenPlane, outlineMaterial))

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  objectScene.overrideMaterial = normalMaterial
  renderer.render(objectScene, objectCamera, normalTexture)

  objectScene.overrideMaterial = depthMaterial
  renderer.render(objectScene, objectCamera, depthTexture)

  objectScene.overrideMaterial = null
  renderer.render(objectScene, objectCamera, sceneTexture)

  renderer.render(scene, camera)
}()