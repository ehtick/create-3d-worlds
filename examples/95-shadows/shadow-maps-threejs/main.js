import * as THREE from 'three'
import { scene, renderer, camera } from '/utils/scene.js'
import { createBox } from '/utils/geometry.js'

const cube = createBox({ castShadow: true })
cube.position.set(0, 1, 0)
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
plane.receiveShadow = true
scene.add(plane)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  cube.rotation.y += 0.01
}()
