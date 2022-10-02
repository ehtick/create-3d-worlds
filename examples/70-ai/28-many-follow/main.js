import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import PlayerFSM from '/utils/fsm/PlayerFSM.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadSorceress, loadGolem } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

const mixers = []
const followers = []

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh: playerMesh, animations } = await loadSorceress()

const player = new PlayerFSM({ mesh: playerMesh, animations, dict: sorceressAnimations })
playerMesh.velocity = new THREE.Vector3() // required by ThreeSteer

scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadGolem({ angle: 0 })

for (let i = 0; i < 10; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  const entity = new SteeringEntity(mesh)
  entity.position.set(randFloatSpread(50), 0, randFloatSpread(50))
  entity.maxSpeed = .025,
  followers.push(entity)
  scene.add(entity)

  const mixer = new THREE.AnimationMixer(mesh)
  const action = mixer.clipAction(followerAnims[1])
  action.startAt(Math.random() * action.getClip().duration)
  action.play()
  mixers.push(mixer)
}

const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

const params = { distance: 2, separationRadius: 1.5, maxSeparation: 2.5, leaderSightRadius: 5, arrivalThreshold: 1 }

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach(follower => {
    follower.followLeader(playerMesh, followers, params.distance, params.separationRadius, params.maxSeparation, params.leaderSightRadius, params.arrivalThreshold)
    follower.lookWhereGoing(true)
    follower.update()
    follower.bounce(boundaries)
  })

  controls.update()
  player.update(delta)
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()
