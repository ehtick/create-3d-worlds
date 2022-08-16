import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import ParticleSystem from '/utils/classes/ParticleSystem.js'

createOrbitControls()
camera.position.z = 20

const light = new THREE.AmbientLight(0x666666)
scene.add(light)

const particles = new ParticleSystem({ parent: scene, camera, texture: '/assets/particles/fire.png' })

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  particles.update(delta)
  renderer.render(scene, camera)
}()
