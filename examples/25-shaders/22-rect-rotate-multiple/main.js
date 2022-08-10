import * as THREE from 'three'
import { material, uniforms } from './shader.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'

const geometry = new THREE.PlaneGeometry(2, 2)

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.y = 0
camera.position.z = 1

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += clock.getDelta()
  renderer.render(scene, camera)
}()
