import * as THREE from 'three'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { material, uniforms } from '/utils/shaders/fractal-4.js'

camera.position.z = 1

const geometry = new THREE.PlaneGeometry(16, 9)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

void function loop() {
  requestAnimationFrame(loop)

  const time = clock.getElapsedTime()
  uniforms.time.value = time

  renderer.render(scene, camera)
}()
