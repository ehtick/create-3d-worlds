import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { moveCamera } from '/utils/player.js'
import { createSunLight } from '/utils/light.js'
import { TerrainChunkManager } from './terrain.js'

scene.add(createSunLight())
scene.background = new THREE.Color(0xbfd1e5)
camera.position.y = 50

const terrain = new TerrainChunkManager(camera)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  moveCamera(camera, delta, 100)
  terrain.Update(delta)

  renderer.render(scene, camera)
}()
