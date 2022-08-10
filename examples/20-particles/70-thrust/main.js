import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { loadModel } from '/utils/loaders.js'
import ParticleSystem from '/utils/classes/ParticleSystem.js'

createOrbitControls()
camera.position.z = 20

const light = new THREE.AmbientLight(0x666666)
scene.add(light)

const particles = new ParticleSystem({ parent: scene, camera, texture: '/assets/particles/fire.png' })

const { mesh } = await loadModel('space/rocket/Rocket_Ship_01.gltf')
scene.add(mesh)

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  particles.update(delta)
  renderer.render(scene, camera)
}()
