// hujiulong / me@hujiulong.com
import { vertexShader, cartoonFragmentShader, outlineFragmentShader } from './shader.js'

let controls, renderer
let scene, camera, light, outlineMaterial
let objectScene, objectCamera
let depthMaterial, normalMaterial
let depthTexture, normalTexture, sceneTexture

// scene
scene = new THREE.Scene()          // 这个场景是用来放置最后贴渲染结果的平面的
objectScene = new THREE.Scene()    // 茶壶和灯光是放在这个场景中

// camera
objectCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
objectCamera.position.set(0, 200, 200)

camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1)

// renderer
renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setClearColor(0xeeeeee)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

const container = document.getElementById('container')
container.appendChild(renderer.domElement)

controls = new THREE.OrbitControls(objectCamera, renderer.domElement)

light = new THREE.DirectionalLight(0xffffff, 0.7)
light.position.set(-1, 0.4, 0.5)
objectScene.add(light)

light = new THREE.AmbientLight(0x222222)
objectScene.add(light)

// material
depthMaterial = new THREE.MeshDepthMaterial()
normalMaterial = new THREE.MeshNormalMaterial()
outlineMaterial = new THREE.ShaderMaterial({
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

depthTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

normalTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

sceneTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight)

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
  objectScene.overrideMaterial = normalMaterial
  renderer.render(objectScene, objectCamera, normalTexture)

  objectScene.overrideMaterial = depthMaterial
  renderer.render(objectScene, objectCamera, depthTexture)

  objectScene.overrideMaterial = null
  renderer.render(objectScene, objectCamera, sceneTexture)

  outlineMaterial.uniforms.depthTexture.needsUpdate = true
  outlineMaterial.uniforms.normalTexture.needsUpdate = true
  outlineMaterial.uniforms.sceneTexture.needsUpdate = true

  renderer.render(scene, camera)
}()