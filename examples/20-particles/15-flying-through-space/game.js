import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createRealStars, updateStars } from '/utils/particles.js'

scene.background = new THREE.Color(0x000000)

const stars = createRealStars()
scene.add(stars)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  updateStars({ particles: stars })
  renderer.render(scene, camera)
}()
