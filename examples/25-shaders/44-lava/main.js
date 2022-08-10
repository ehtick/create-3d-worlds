import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { material, uniforms } from '/utils/shaders/lava.js'

createOrbitControls()

const geometry = new THREE.SphereGeometry()
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  uniforms.time.value += 0.8 * clock.getDelta()
  renderer.render(scene, camera)
}()