import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/perlin.js'

camera.position.z = 4

const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 20, 20, 20)
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)

const box = new THREE.Mesh(boxGeometry, material)
scene.add(box)
box.position.x = -3

const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)
sphere.position.x = 3

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  box.rotation.x += 0.005
  box.rotation.y += 0.01

  sphere.rotation.x += 0.005
  sphere.rotation.y += 0.01

  renderer.render(scene, camera)
}()