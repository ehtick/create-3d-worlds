import * as THREE from '/node_modules/three127/build/three.module.js'
import { OrbitControls } from '/node_modules/three127/examples/jsm/controls/OrbitControls.js'
import { TeapotGeometry } from '/node_modules/three127/examples/jsm/geometries/TeapotGeometry.js'

import { vertexShader, fragmentShader } from './shader.js'

let camera, scene, renderer, light
let cameraControls, effectController, phongMaterial
const clock = new THREE.Clock()

function fillScene() {
  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xAAAAAA, 2000, 4000)

  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0x333333) // 0.2

  light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
  light.position.set(320, 390, 700)

  scene.add(ambientLight)
  scene.add(light)

  const teapotSize = 400
  const materialColor = new THREE.Color()
  materialColor.setRGB(1.0, 0.8, 0.6)

  phongMaterial = createShaderMaterial('phongDiffuse', light)

  phongMaterial.uniforms.uMaterialColor.value.copy(materialColor)
  phongMaterial.side = THREE.DoubleSide

  const teapot = new THREE.Mesh(
    new TeapotGeometry(teapotSize, 20, true, true, true, true), phongMaterial)
  scene.add(teapot)

}

function init() {
  const canvasWidth = window.innerWidth
  const canvasHeight = window.innerHeight
  const canvasRatio = canvasWidth / canvasHeight

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.gammaInput = true
  renderer.gammaOutput = true
  renderer.setSize(canvasWidth, canvasHeight)

  camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 80000)
  camera.position.set(-600, 900, 1300)

  cameraControls = new OrbitControls(camera, renderer.domElement)
  cameraControls.target.set(0, 0, 0)
}

function addToDOM() {
  document.body.appendChild(renderer.domElement)
}

function animate() {
  window.requestAnimationFrame(animate)
  render()
}

function render() {
  const delta = clock.getDelta()
  cameraControls.update(delta)

  // take inputs from sliders and modify shader's values
  phongMaterial.uniforms.uKd.value = effectController.kd
  phongMaterial.uniforms.uBorder.value = effectController.border

  const materialColor = new THREE.Color()
  materialColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness)
  phongMaterial.uniforms.uMaterialColor.value.copy(materialColor)

  light.position.set(effectController.lx, effectController.ly, effectController.lz)

  light.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness)

  renderer.render(scene, camera)
}

function loadShader(shadertype) {
  return document.getElementById(shadertype).textContent
}

function createShaderMaterial(id, light) {
  const shaderTypes = {
    'phongDiffuse': {
      uniforms: {
        'uDirLightPos':	{ type: 'v3', value: new THREE.Vector3() },
        'uDirLightColor': { type: 'c', value: new THREE.Color(0xFFFFFF) },
        'uMaterialColor': { type: 'c', value: new THREE.Color(0xFFFFFF) },
        uKd: {
          type: 'f',
          value: 0.7
        },
        uBorder: {
          type: 'f',
          value: 0.4
        }
      }
    }
  }

  const shader = shaderTypes[id]

  const u = THREE.UniformsUtils.clone(shader.uniforms)

  const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader, fragmentShader })

  material.uniforms.uDirLightPos.value = light.position
  material.uniforms.uDirLightColor.value = light.color

  return material
}

function setupGui() {
  effectController = {

    kd: 0.7,
    border: 0.4,

    hue: 0.09,
    saturation: 0.46,
    lightness: 0.7,

    lhue: 0.04,
    lsaturation: 0.01,
    llightness: 0.7,

    // bizarrely, if you initialize these with negative numbers, the sliders
    // will not show any decimal places.
    lx: 0.32,
    ly: 0.39,
    lz: 0.7
  }
}

init()
fillScene()
setupGui()
addToDOM()
animate()
