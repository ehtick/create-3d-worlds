import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createParticles } from '/utils/particles.js'

scene.background = new THREE.Color(0x000000)
camera.position.z = 500

const stars = createParticles()
scene.add(stars)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  // camera.position.z -= .3
  renderer.render(scene, camera)
}()
