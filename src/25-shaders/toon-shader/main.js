import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { uniforms, material } from './shader.js'

createOrbitControls()

const lightDirection = new THREE.Vector3(5.0, 5.0, 0.0)
uniforms.uLightDir.value = lightDirection.clone()

const torus = new THREE.Mesh(new THREE.TorusGeometry(2, 0.5, 16, 50), material)
scene.add(torus)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  torus.rotation.x -= delta * 0.5
  torus.rotation.y += delta * 0.5
  renderer.render(scene, camera)
}()
