// https://threejs.org/examples/webgl_shader2.html
import * as THREE from '/node_modules/three127/build/three.module.js'
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
  const delta = clock.getDelta()

  ledMaterial.uniforms.time.value += delta * 5
  marbleMaterial.uniforms.time.value = clock.elapsedTime

  marbleBox.rotation.y += delta * -0.5
  ledBox.rotation.y += delta * 0.5

  renderer.render(scene, camera)
}()