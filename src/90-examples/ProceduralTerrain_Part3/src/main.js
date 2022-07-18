import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'

import { FPSControls } from './controls.js'
import { TerrainChunkManager } from './terrain.js'

function initLights() {
  let light = new THREE.DirectionalLight(0x808080, 1, 100)
  light.position.set(-100, 100, -100)
  light.target.position.set(0, 0, 0)
  light.castShadow = false
  scene.add(light)

  light = new THREE.DirectionalLight(0x404040, 1.5, 100)
  light.position.set(100, 100, -100)
  light.target.position.set(0, 0, 0)
  light.castShadow = false
  scene.add(light)
}

initLights()
scene.background = new THREE.Color(0xbfd1e5)

const userCamera = new THREE.Object3D()
userCamera.position.set(475, 75, 900)
camera.position.copy(userCamera.position)

const entities = {}
entities._terrain = new TerrainChunkManager(userCamera)
entities._controls = new FPSControls(userCamera)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  camera.position.copy(userCamera.position)
  camera.quaternion.copy(userCamera.quaternion)
  for (const k in entities)
    entities[k].Update(delta)
  renderer.render(scene, camera)
}()
