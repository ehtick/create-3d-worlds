import { MathUtils } from 'three'
import Player from '/utils/player/Player.js'
import NPC from '/utils/player/NPC.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadSorceress, loadGolem } from '/utils/loaders.js'
import { sorceressAnimations, golemAnimation } from '/data/animations.js'

/* this example uses Player for AI */

const { randFloatSpread } = MathUtils

const npcs = []

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

const mapSize = 100

scene.add(createFloor({ size: mapSize }))

const { mesh: playerMesh, animations } = await loadSorceress()
const player = new Player({ mesh: playerMesh, animations, dict: sorceressAnimations, speed: 4 })

scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadGolem({ angle: 0 })

for (let i = 0; i < 5; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  const npc = new NPC({ mesh, animations: followerAnims, dict: golemAnimation, mapSize })
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
    npc.followLeader(playerMesh, entities)
    npc.update(delta)
  })

  controls.update()
  player.update(delta)
  renderer.render(scene, camera)
}()
