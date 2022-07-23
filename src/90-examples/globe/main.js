import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'

const textureLoader = new THREE.TextureLoader()

scene.add(createSunLight())

const controls = createOrbitControls()

const geometry = new THREE.SphereGeometry(3, 720, 360)
const material = new THREE.MeshStandardMaterial()
const texture = textureLoader.load('/assets/textures/planets/earth-5400x2700-color.jpg')
texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
material.map = texture

material.displacementMap = textureLoader.load('/assets/textures/planets/earth-5400x2700.jpg')
material.displacementScale = 0.2

const sphere = new THREE.Mesh(geometry, material)
sphere.rotation.y = -Math.PI / 2
sphere.castShadow = sphere.receiveShadow = true
scene.add(sphere)

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()