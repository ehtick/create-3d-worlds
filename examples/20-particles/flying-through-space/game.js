import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { Stars } from '/utils/classes/Particles.js'

scene.background = new THREE.Color(0x000000)

const stars = new Stars()
scene.add(stars.particles)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  stars.update()
  renderer.render(scene, camera)
}()
