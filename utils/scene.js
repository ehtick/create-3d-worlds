import * as THREE from '/node_modules/three/build/three.module.js'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import { createSkySphere } from './geometry.js'
import { createGround } from './ground.js'
import { initLights, hemLight, createSunLight } from './light.js'
import { baseCommands } from '/data/commands.js'

export const clock = new THREE.Clock()
export const scene = new THREE.Scene()

export function createWorldScene(groundParam, skyParam, lightParam, fogParam = {}) {
  scene.add(createGround(groundParam))
  scene.add(createSkySphere(skyParam))
  const light = createSunLight(lightParam)
  // const helper = new THREE.CameraHelper(light.shadow.camera)
  // scene.add(helper)
  scene.add(light)
  const { color = 0xffffff, near = 1, far = 5000 } = fogParam
  scene.fog = new THREE.Fog(color, near, far)
  hemLight({ scene, intensity: 0.5 })
  return scene
}

// CAMERA

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
camera.position.z = 4
camera.position.y = 2

// RENDERER

export const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
document.body.style.margin = 0
const container = document.getElementById('container') || document.body
container.appendChild(renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)
// Some mobiles have a pixel ratio 5. Improve battery life by limiting this to 2.
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
renderer.domElement.focus()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// fix lights for some models (glb, fbx)
export function gamaRender() {
  renderer.gammaFactor = 2.2
  renderer.outputEncoding = THREE.GammaEncoding
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
})

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())

/* CONTROLS */

export function createOrbitControls(cam = camera, el = renderer.domElement) {
  const controls = new OrbitControls(cam, el)
  controls.maxPolarAngle = Math.PI / 2 - 0.1 // prevent bellow ground, negde ne radi, za avion radi
  // controls.maxDistance = 20
  controls.enableKeys = false
  controls.minDistance = 2
  controls.zoomSpeed = .3
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  return controls
}

/* UI */

export function addUIControls({ commands = baseCommands, title = 'COMMANDS' } = {}) {
  const translateKey = key => {
    key = key.replace(/Key/, '') // eslint-disable-line no-param-reassign
    switch (key) {
      case 'ArrowLeft':
        return '←'
      case 'ArrowRight':
        return '→'
      case 'ArrowUp':
        return '↑'
      case 'ArrowDown':
        return '↓'
      default:
        return key
    }
  }

  const style = {
    position: 'absolute',
    top: 0,
    left: 0,
    color: '#fff',
    paddingTop: '4px',
    paddingBottom: '4px',
  }
  const margins = `
    margin-top:4px;
    margin-bottom:4px
  `
  const div = document.createElement('div')
  Object.assign(div.style, style)
  div.innerHTML = Object.keys(commands).reduce(
    (acc, key) => acc + `<p style="${margins}">${translateKey(key)}: ${commands[key]}</p>`,
    `<h3 style="${margins}">${title}</h2>`
  )
  document.body.appendChild(div)
}

export function addScoreUI({ score = 0, title = 'Score' } = {}) {
  const div = document.createElement('div')
  const style = `
    position: absolute;
    color: yellow;
    top: 20px;
    right: 20px;
  `
  div.style.cssText = style
  document.body.appendChild(div)

  const updateScore = (point = 1) => {
    score += point // eslint-disable-line no-param-reassign
    div.innerHTML = `${title}: ${score}`
  }
  updateScore(0)
  return updateScore
}

// SKYBOX

export function createSkyBox({ folder = 'skybox2' } = {}) {
  const texture = new THREE.CubeTextureLoader()
    .setPath(`/assets/images/${folder}/`)
    .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
  // texture.format = THREE.RGBFormat
  return texture
}

/* SHORTCUTS */

export { createGround, initLights, hemLight }