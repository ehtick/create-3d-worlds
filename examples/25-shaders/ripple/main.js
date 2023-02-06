import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { material, uniforms } from '/utils/shaders/ripple.js'

camera.position.set(0, 0, 1)

const geometry = new THREE.PlaneGeometry(2, 1.5)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

void function animate() {
  requestAnimationFrame(animate)

  uniforms.u_time.value += clock.getDelta()
  renderer.render(scene, camera)
}()