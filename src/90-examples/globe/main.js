import * as THREE from '/node_modules/three127/build/three.module.js'
import { OrbitControls } from '/node_modules/three127/examples/jsm/controls/OrbitControls.js'

const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)

const light = new THREE.DirectionalLight(0xffffff, 2)
light.position.set(0, 0, 3)

scene.add(light)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true

const sphereGeometry = new THREE.SphereGeometry(1, 720, 360)
const material = new THREE.MeshStandardMaterial()
const texture = new THREE.TextureLoader().load('img/worldColour.5400x2700.jpg')
texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
material.map = texture

const displacementMap = new THREE.TextureLoader().load('img/srtm_ramp2.world.5400x2700.jpg')
material.displacementMap = displacementMap
material.displacementScale = 0.1

const sphere = new THREE.Mesh(sphereGeometry, material)
sphere.rotation.y = -Math.PI / 2
sphere.castShadow = true
sphere.receiveShadow = true
scene.add(sphere)

camera.position.z = 2

void function animate() {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(scene, camera)
}()