import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material } from './shader.js'

createOrbitControls()
const start = Date.now()

const mesh = new THREE.Mesh(
  new THREE.SphereGeometry(2, 200, 100),
  material
)
scene.add(mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  material.uniforms.u_time.value = Date.now() - start
  renderer.render(scene, camera)
}()