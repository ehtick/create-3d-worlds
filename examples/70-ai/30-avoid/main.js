import { camera, scene, renderer, createOrbitControls, clock } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { ghostAnimations } from '/data/animations.js'
import NPC from '/utils/player/NPC.js'
import { createBox } from '/utils/geometry.js'
import { randomInSquare } from '/utils/helpers.js'

const mapSize = 100
const npcs = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createGround({ size: mapSize }))

const { mesh, animations } = await loadModel({ file: 'character/ghost/scene.gltf' })

const obstacles = []

for (let i = 0; i < 50; i++) {
  const npc = new NPC({ mesh, animations, dict: ghostAnimations, mapSize })
  const box = createBox({ size: 2 })
  const { x, z } = randomInSquare(mapSize)
  box.position.set(x, box.position.y, z)

  npcs.push(npc)
  obstacles.push(box)
  console.log(box)
  scene.add(box, npc.entity)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  npcs.forEach(npc => {
    npc.wander()
    npc.entity.avoid(obstacles)
    npc.update(delta)
  })

  renderer.render(scene, camera)
}()