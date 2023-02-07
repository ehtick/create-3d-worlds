import { MathUtils } from 'three'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadSorceress, loadGolem } from '/utils/loaders.js'
import { sorceressAnimations, golemAnimation } from '/data/animations.js'
import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'

const { randFloatSpread } = MathUtils

const mapSize = 100
const npcs = []

ambLight()
camera.position.set(0, 10, 15)
createOrbitControls()

scene.add(createFloor({ size: mapSize }))

const player = new Player({ ...await loadSorceress(), dict: sorceressAnimations })
scene.add(player.mesh)

const { mesh, animations } = await loadGolem()

for (let i = 0; i < 10; i++) {
  const ai = new AI({ mesh, animations, dict: golemAnimation, mapSize })
  ai.position.set(randFloatSpread(mapSize), 0, randFloatSpread(mapSize))
  npcs.push(ai)
  scene.add(ai.mesh)
}

/* LOOP */

void function animate(timestamp) {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  npcs.forEach(ai => {
    ai.update(delta, timestamp)
  })

  player.update(delta)
  renderer.render(scene, camera)
}(0)
