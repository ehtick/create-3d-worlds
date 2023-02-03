import * as THREE from 'three'

import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { ghostAnimations } from '/data/animations.js'
import NPC from '/utils/player/NPC.js'

const { randFloatSpread } = THREE.MathUtils

const mapSize = 100
const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const { mesh, animations } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 20; i++) {
  const npc = new NPC({ mesh, animations, mapSize, dict: ghostAnimations })
  npc.position.set(randFloatSpread(mapSize), -.5, randFloatSpread(mapSize))
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  npcs.forEach(npc => {
    npc.wander()
    npc.update()
  })

  renderer.render(scene, camera)
}()