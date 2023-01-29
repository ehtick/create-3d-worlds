import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createStars, updateStars } from '/utils/particles.js'
import Particles from '/utils/classes/Particles.js'

scene.background = new THREE.Color(0x000000)

const stars = new Particles()
scene.add(stars.particles)


/* LOOP */

void function render() {
  requestAnimationFrame(render)
  stars.update() // Stars({ particles: stars })
  renderer.render(scene, camera)
}()
