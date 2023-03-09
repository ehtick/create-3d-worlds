import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import Particles from '/utils/classes/Particles.js'

createOrbitControls()
hemLight()

const particles = new Particles({ file: 'smoke.png', size: 9, num: 100, minRadius: 1, maxRadius: 3, color: 0x999999, blending: THREE.NormalBlending })
scene.add(particles.mesh)
particles.mesh.rotateX(Math.PI)

/* LOOP */

void function loop() {
  particles.update({ rotateY: .009, min: -9, max: 3, minVelocity: 2, maxVelocity: 5, axis: 1 })
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
