import * as THREE from 'three'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations, ghostAnimations } from '/data/animations.js'
import Player from '/utils/player/Player.js'
import NPC from '/utils/player/NPC.js'

const { randFloatSpread } = THREE.MathUtils

const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadRobotko()
const player = new Player({ mesh, animations, dict: robotkoAnimations })
scene.add(mesh)

const { mesh: ghostMesh, animations: ghostAnims } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 5; i++) {
  const npc = new NPC({ mesh: ghostMesh, animations: ghostAnims, dict: ghostAnimations })
  npc.position.set(randFloatSpread(50), -.5, randFloatSpread(50))
  npc.maxSpeed = .05
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    const { entity } = npc
    if (npc.position.distanceTo(mesh.position) > 1) {
      entity.seek(mesh.position)
      entity.lookWhereGoing(true)
    } else
      entity.idle()

    entity.update()
    npc.update()
  })

  player.update(delta)
  renderer.render(scene, camera)
}()
