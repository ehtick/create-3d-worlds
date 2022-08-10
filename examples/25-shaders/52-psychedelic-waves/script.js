import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/psychedelic.js'

let time = 0

const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  time += .2
  plane.material.uniforms.uTime.value = time

  renderer.render(scene, camera)
}()
