import * as THREE from '/node_modules/three127/build/three.module.js'
// import { camera, scene, renderer } from '/utils/scene.js'

const parameters = {
  speed: .2,
  hue: .5,
  hueVariation: 1,
  gradient: .3,
  density: .5,
  displacement: .66
}

const mousePos = { x: 0, y: 0, px: 0, py: 0 }
let plane

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true })

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
const container = document.getElementsByClassName('world')[0]
const scene = new THREE.Scene()
const aspectRatio = window.innerWidth / window.innerHeight
const fieldOfView = 50
const nearPlane = .1
const farPlane = 20000
const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
camera.position.z = 200
container.appendChild(renderer.domElement)
let timer = 0
const targetMousePos = { x: 0, y: 0 }

createPlane()
render()

function createPlane() {
  const material = new THREE.RawShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,

    uniforms: {
      uTime: { type: 'f', value: 0 },
      uHue: { type: 'f', value: .5 },
      uHueVariation: { type: 'f', value: 1 },
      uGradient: { type: 'f', value: 1 },
      uDensity: { type: 'f', value: 1 },
      uDisplacement: { type: 'f', value: 1 },
      uMousePosition: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) } } })

  const planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

  plane = new THREE.Mesh(planeGeometry, material)
  scene.add(plane)
}

function render() {
  timer += parameters.speed
  plane.material.uniforms.uTime.value = timer

  mousePos.x += (targetMousePos.x - mousePos.x) * .1
  mousePos.y += (targetMousePos.y - mousePos.y) * .1

  if (plane)
    plane.material.uniforms.uMousePosition.value = new THREE.Vector2(mousePos.x, mousePos.y)

  renderer.render(scene, camera)
}

function loop() {
  render()
  requestAnimationFrame(loop)
}

function mouseMove(mousePos) {
  targetMousePos.x = mousePos.px
  targetMousePos.y = mousePos.py
}

document.addEventListener('DOMContentLoaded', domIsReady)

function domIsReady() {
  document.addEventListener('mousemove', handleMouseMove, false)
  loop()
}

function handleMouseMove(e) {
  mousePos.x = e.clientX
  mousePos.y = e.clientY
  mousePos.px = mousePos.x / window.innerWidth
  mousePos.py = 1.0 - mousePos.y / window.innerHeight
  mouseMove(mousePos)
}