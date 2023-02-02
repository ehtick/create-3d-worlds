import { MathUtils } from 'three'
import Player from '/utils/player/Player.js'
import NPC from '/utils/player/NPC.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadSorceress, loadGolem } from '/utils/loaders.js'
import { sorceressAnimations, golemAnimation } from '/data/animations.js'

const { randFloatSpread } = MathUtils

const npcs = []
const mapSize = 100

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const player = new Player({ ...await loadSorceress(), dict: sorceressAnimations, speed: 4 })
scene.add(player.mesh)

const { mesh, animations } = await loadGolem({ angle: 0 })

for (let i = 0; i < 5; i++) {
  const npc = new NPC({ mesh, animations, dict: golemAnimation, mapSize })
  npc.position.set(randFloatSpread(25), 0, randFloatSpread(25))
  npc.entity.maxSpeed = .02
  npcs.push(npc)
  scene.add(npc.entity)
}

const entities = npcs.map(npc => npc.entity)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.followLeader(player.mesh, entities)
    npc.update(delta)
  })

  player.update(delta)
  renderer.render(scene, camera)
}()
