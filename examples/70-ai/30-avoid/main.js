import { camera, scene, renderer, createOrbitControls, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { ghostAnimations } from '/data/animations.js'
import NPC from '/utils/player/NPC.js'

const mapSize = 100
const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const { mesh, animations } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 50; i++) {
  const npc = new NPC({ mesh, animations, dict: ghostAnimations, mapSize })
  npcs.push(npc)
  scene.add(npc.entity)
}

const entities = npcs.map(npc => npc.entity)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.wander()
    npc.entity.avoid(entities)
    npc.update(delta)
  })

  renderer.render(scene, camera)
}()