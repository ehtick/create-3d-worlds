import * as THREE from 'three'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadSorceress, loadGolem } from '/utils/loaders.js'
import { sorceressAnimations, golemAnimation } from '/data/animations.js'
import Player from '/utils/player/Player.js'
import NPC from '/utils/player/NPC.js'

const { randFloatSpread } = THREE.MathUtils

const npcs = []

ambLight()
camera.position.set(0, 10, 15)
createOrbitControls()

scene.add(createFloor({ size: 100 }))

const player = new Player({ ...await loadSorceress(), dict: sorceressAnimations })
scene.add(player.mesh)

const { mesh: followerMesh, animations: followerAnims } = await loadGolem()

for (let i = 0; i < 10; i++) {
  const npc = new NPC({ mesh: followerMesh, animations: followerAnims, dict: golemAnimation })
  npc.position.set(randFloatSpread(50), 0, randFloatSpread(50))
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.update(delta)
  })

  player.update(delta)
  renderer.render(scene, camera)
}()
