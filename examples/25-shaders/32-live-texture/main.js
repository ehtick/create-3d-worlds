import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { material as marbleMaterial } from '/utils/shaders/marble.js'
import { material as ledMaterial } from '/utils/shaders/led.js'

camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)

const marbleBox = new THREE.Mesh(geometry, marbleMaterial)
marbleBox.position.set(-1, 0, 0)

const ledBox = new THREE.Mesh(geometry, ledMaterial)
ledBox.position.set(1, 0, 0)

scene.add(ledBox, marbleBox)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const time = clock.getElapsedTime()

  marbleMaterial.uniforms.time.value = time
  ledMaterial.uniforms.time.value = time * 3

  marbleBox.rotation.y = time * -0.5
  ledBox.rotation.y = time * 0.5

  renderer.render(scene, camera)
}()