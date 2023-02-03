import * as THREE from 'three'
import NPC from '/utils/player/NPC.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

const { randFloatSpread } = THREE.MathUtils

const mapSize = 100
const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const { mesh, animations, mixer } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 20; i++) {
  const npc = new NPC({ mesh, animations, mapSize, dict: { idle: 'Take 001' } })
  npc.maxSpeed = .03
  npc.position.set(randFloatSpread(mapSize), -.5, randFloatSpread(mapSize))
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.entity.wander()
    npc.entity.lookWhereGoing(true)
    npc.entity.update()
    // entity.bounce(boundaries)
    npc.update(delta)
  })

  renderer.render(scene, camera)
}()