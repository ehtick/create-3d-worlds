import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'

import Player from '/utils/fsm/Player.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'
import { dirLight, lightFollow } from '/utils/light.js'
import { createStoneCircles } from '/utils/geometry/towers.js'

camera.position.y = 15
createOrbitControls()

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

const stones = createStoneCircles({ radius: 5 })
scene.add(stones)

const plane = createGround({ size: 20 })
scene.add(plane)

const { mesh, animations } = await loadSorceress()
const player = new Player({ mesh, animations, dict: sorceressAnimations })
scene.add(mesh)

const light = dirLight({ target: mesh, mapSize: 1024, area: 10 })

/* LOOP */

void function loop() {
  lightFollow(light, mesh, [12, 18, 1])

  const delta = clock.getDelta()
  player.update(delta)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()