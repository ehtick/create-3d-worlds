import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSaturn } from '/utils/geometry/planets.js'
import { initLights } from '/utils/light.js'

initLights()
scene.background = new THREE.Color(0x000000)
camera.position.set(0, 0, 5)

const saturn = createSaturn()
scene.add(saturn)

/* LOOP */

let add = 0.01

void function loop() {
  requestAnimationFrame(loop)

  saturn.position.y += add
  if (saturn.position.y >= 1 || saturn.position.y <= -1)
    add *= -1

  renderer.render(scene, camera)
}()