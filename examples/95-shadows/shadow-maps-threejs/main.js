import * as THREE from 'three'
import { scene, renderer, camera } from '/utils/scene.js'
import { createBox } from '/utils/geometry.js'
import { createFloor } from '/utils/ground.js'

const cube = createBox({ castShadow: true })
cube.position.y = 1
scene.add(cube)

const plane = createFloor()
scene.add(plane)

const light = new THREE.DirectionalLight(0xffffff)
light.position.set(12, 8, 1)
light.castShadow = true
light.intensity = 1.5
scene.add(light)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}()
