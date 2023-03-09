import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { FlameThrower } from '/utils/classes/Particles.js'

createOrbitControls()
scene.background = new THREE.Color(0x000000)

const particles = new FlameThrower({ size: 10, num: 100, minRadius: 0, maxRadius: .75 })
scene.add(particles.mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  particles.update({ min: -5, max: 5, minVelocity: .1, maxVelocity: .2 })
  renderer.render(scene, camera)
}()
