import * as THREE from '/node_modules/three127/build/three.module.js'
import { OrbitControls } from '/node_modules/three127/examples/jsm/controls/OrbitControls.js'
import { scene, camera, renderer } from '/utils/scene.js'

const textureLoader = new THREE.TextureLoader()

const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)

const light = new THREE.DirectionalLight(0xffffff, 2)
light.position.set(0, 0, 3)

scene.add(light)

const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true

const sphereGeometry = new THREE.SphereGeometry(3, 720, 360)
const material = new THREE.MeshStandardMaterial()
const texture = textureLoader.load('img/worldColour.5400x2700.jpg')
texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
material.map = texture

material.displacementMap = textureLoader.load('img/world.5400x2700.jpg')
material.displacementScale = 0.2

const sphere = new THREE.Mesh(sphereGeometry, material)
sphere.rotation.y = -Math.PI / 2
sphere.castShadow = sphere.receiveShadow = true
scene.add(sphere)

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()