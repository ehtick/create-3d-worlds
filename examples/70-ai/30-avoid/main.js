import { camera, scene, renderer, createOrbitControls, setBackground, clock } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createMoon } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { ghostAnimations } from '/data/animations.js'
import NPC from '/utils/player/NPC.js'
import { createBox } from '/utils/geometry.js'
import { randomInSquare } from '/utils/helpers.js'
import { createTomb } from '/utils/geometry/shapes.js'

const mapSize = 100
const npcs = []

setBackground(0x070b34)
scene.add(createMoon({ intensity: .5, position: [15, 30, -30] }))
createOrbitControls()
camera.position.set(15, 5, 30)
camera.lookAt(scene.position)

scene.add(createGround({ size: mapSize }))

const { mesh, animations } = await loadModel({ file: 'character/ghost/scene.gltf' })

const obstacles = []

for (let i = 0; i < 50; i++) {
  const { x, z } = randomInSquare(mapSize)
  const tomb = createTomb({ x, y: -1, z })
  obstacles.push(tomb)
  scene.add(tomb)

  const npc = new NPC({ mesh, animations, dict: ghostAnimations, mapSize })
  npcs.push(npc)
  scene.add(npc.entity)
}

for (let i = 0; i < 3; i++) {
  const tombstone = createBox({ width: 2, height: 3, depth: 2, file: 'tomb.jpg' })
  const { x, z } = randomInSquare(mapSize)
  tombstone.position.set(x, tombstone.position.y, z)

  obstacles.push(tombstone)
  scene.add(tombstone)
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