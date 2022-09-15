import * as THREE from 'three'
import { scene, renderer, camera } from '/utils/scene.js'

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(0, 1, 0)
cube.castShadow = true
scene.add(cube)

const light = new THREE.DirectionalLight(0xffffff)
light.position.set(12, 8, 1)
light.castShadow = true
light.intensity = 1.5
scene.add(light)

const planeGeometry = new THREE.PlaneGeometry(15, 15, 15)
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffcccc })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.rotation.x = 5
plane.position.set(0, -1, 0)
plane.castShadow = true
plane.receiveShadow = true
scene.add(plane)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
}()
