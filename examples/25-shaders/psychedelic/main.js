import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/psychedelic.js'

let time = 0

const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  plane.material.uniforms.uTime.value = time += .2

  renderer.render(scene, camera)
}()
