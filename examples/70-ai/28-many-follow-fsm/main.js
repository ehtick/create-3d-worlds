import { Box3, Vector3, MathUtils } from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
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

const followers = []
const npcs = []

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

const mapSize = 100
const halfMap = mapSize / 2

scene.add(createFloor({ size: mapSize }))
const boundaries = new Box3(new Vector3(-halfMap, 0, -halfMap), new Vector3(halfMap, 0, halfMap))

const { mesh: playerMesh, animations } = await loadSorceress()
const player = new Player({ mesh: playerMesh, animations, dict: sorceressAnimations, speed: 4 })

scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadGolem({ angle: 0 })

for (let i = 0; i < 5; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  const npc = new NPC({ mesh, animations: followerAnims, dict: golemAnimation })
  npc.position.set(randFloatSpread(25), 0, randFloatSpread(25))
  npc.entity.maxSpeed = .02
  followers.push(npc.entity)
  npcs.push(npc)
  scene.add(npc.entity)
}

/* LOOP */

const params = { distance: 2, separationRadius: 2, maxSeparation: 4, leaderSightRadius: 4, arrivalThreshold: 2 }

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach((follower, i) => {
    const npc = npcs[i]
    follower.followLeader(playerMesh, followers, params.distance, params.separationRadius, params.maxSeparation, params.leaderSightRadius, params.arrivalThreshold)
    follower.lookWhereGoing(true)
    follower.update()
    follower.bounce(boundaries)
    npc.keyboard.pressed.KeyW = true
    npc.update(delta)
  })

  controls.update()
  player.update(delta)
  renderer.render(scene, camera)
}()
