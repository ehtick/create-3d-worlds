import * as THREE from 'three'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import chroma from '/libs/chroma.js'
import { material } from './shader.js'

const conf = {
  el: 'canvas',
  fov: 75,
  cameraZ: 400,
  background: 0x00001a,
  numPoints: 50000 }

let renderer, scene, camera, cameraCtrl, startTime
let width, height
let points

const mouse = new THREE.Vector2(0.2, 0.2)
const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math

renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el) })
camera = new THREE.PerspectiveCamera(conf.fov)
camera.far = 10000
camera.position.z = conf.cameraZ
cameraCtrl = new OrbitControls(camera, renderer.domElement)
cameraCtrl.enableKeys = false
cameraCtrl.enableDamping = true
cameraCtrl.dampingFactor = 0.1
cameraCtrl.rotateSpeed = 0.1

updateSize()
window.addEventListener('resize', updateSize, false)
renderer.domElement.addEventListener('mousemove', e => {
  mouse.x = e.clientX / width * 2 - 1
  mouse.y = -(e.clientY / height) * 2 + 1
})

startTime = Date.now()
initScene()
animate()

function initScene() {
  scene = new THREE.Scene()
  if (conf.background) scene.background = new THREE.Color(conf.background)

  const cscale = chroma.scale([0x00b9e0, 0xff880a, 0x5f1b90, 0x7ec08d])
  const positions = new Float32Array(conf.numPoints * 3)
  const colors = new Float32Array(conf.numPoints * 3)
  const sizes = new Float32Array(conf.numPoints)
  const rotations = new Float32Array(conf.numPoints)
  const sCoef = new Float32Array(conf.numPoints)
  const position = new THREE.Vector3()
  let color
  for (let i = 0; i < conf.numPoints; i++) {
    position.set(rndFS(1000), rndFS(1000), rndFS(2000))
    position.toArray(positions, i * 3)
    color = new THREE.Color(cscale(rnd(0, 1)).hex())
    color.toArray(colors, i * 3)
    sizes[i] = rnd(5, 100)
    sCoef[i] = rnd(0.0005, 0.005)
    rotations[i] = rnd(0, Math.PI)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1))
  geometry.setAttribute('sCoef', new THREE.BufferAttribute(sCoef, 1))

  points = new THREE.Points(geometry, material)
  scene.add(points)

  renderer.domElement.addEventListener('mouseup', e => {
    randomColors()
  })
}

function randomColors() {
  startTime = Date.now()
  const cscale = chroma.scale([chroma.random(), chroma.random(), chroma.random(), chroma.random()])
  const colors = points.geometry.attributes.color.array
  let j, color
  for (let i = 0; i < conf.numPoints; i++) {
    j = i * 3
    color = cscale(rnd(0, 1))
    colors[j] = color.get('rgb.r') / 0xff
    colors[j + 1] = color.get('rgb.g') / 0xff
    colors[j + 2] = color.get('rgb.b') / 0xff
  }
  points.geometry.attributes.color.needsUpdate = true
}

function animate() {
  requestAnimationFrame(animate)

  const time = Date.now() - startTime
  points.material.uniforms.uTime.value = time
  points.rotation.z += -mouse.x * 0.03

  if (cameraCtrl) cameraCtrl.update()
  renderer.render(scene, camera)
}

function updateSize() {
  width = window.innerWidth
  height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}
