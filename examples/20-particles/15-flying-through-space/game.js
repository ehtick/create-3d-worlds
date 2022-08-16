import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createStars, updateStars } from '/utils/particles.js'

scene.background = new THREE.Color(0x000000)

const stars = createStars()
scene.add(stars)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  updateStars({ particles: stars })
  renderer.render(scene, camera)
}()
