import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { material } from '/utils/shaders/led.js'

camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry()
const box = new THREE.Mesh(geometry, material)

scene.add(box)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const time = clock.getElapsedTime()

  material.uniforms.time.value = time * 3
  box.rotation.y = time * 0.5

  renderer.render(scene, camera)
}()