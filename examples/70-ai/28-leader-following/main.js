import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { createBox } from '/utils/geometry.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 10)

const floor = createFloor({ size: 100 })
scene.add(floor)

const { mesh, animations } = await loadRobotko()
const player = new StateMachine({ mesh, animations, dict: robotAnimations })
mesh.velocity = new THREE.Vector3()

scene.add(mesh)

const followers = []
for (let i = 0; i < 20; i++) {
  const mesh = createBox({ height: 2, color: 0x000000 })
  const entity = new SteeringEntity(mesh)
  entity.position.set(randFloatSpread(50), 0, randFloatSpread(50))
  entity.maxSpeed = .05,
  followers.push(entity)
  scene.add(entity)
}

const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

const params = { distance: 4, separationRadius: 3, maxSeparation: 5, leaderSightRadius: 10, arrivalThreshold: 2 }

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach(follower => {
    follower.followLeader(mesh, followers, params.distance, params.separationRadius, params.maxSeparation, params.leaderSightRadius, params.arrivalThreshold)
    follower.lookWhereGoing(true)
    follower.update()
    follower.bounce(boundaries)
  })

  controls.update()
  player.update(delta)
  renderer.render(scene, camera)
}()
