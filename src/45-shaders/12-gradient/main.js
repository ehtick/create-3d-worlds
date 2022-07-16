import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/gradient-blue.js'

const geometry = new THREE.PlaneGeometry(10, 10)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}()

window.addEventListener('resize', () => {
  material.uniforms.resolution.value.x = window.innerWidth
  material.uniforms.resolution.value.y = window.innerHeight
})
