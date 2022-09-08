import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { Keyboard } from '/utils/classes/Keyboard.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadKachujin, loadMawLaygo } from '/utils/loaders.js'
import { girlAnimations, mawLaygoAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

const followers = []
const ais = []

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh: playerMesh, animations } = await loadKachujin()
const player = new StateMachine({ mesh: playerMesh, animations, dict: girlAnimations })
playerMesh.velocity = new THREE.Vector3() // required for steer

scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadMawLaygo({ angle: 0 })

for (let i = 0; i < 5; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  const ai = new StateMachine({ mesh, animations: followerAnims, dict: mawLaygoAnimations, keyboard: new Keyboard(false) })
  ai.shouldMove = false
  const entity = new SteeringEntity(mesh)
  entity.position.set(randFloatSpread(25), 0, randFloatSpread(25))
  entity.maxSpeed = .02
  followers.push(entity)
  ais.push(ai)
  scene.add(entity)
}

/* LOOP */

const params = { distance: 2, separationRadius: 2, maxSeparation: 4, leaderSightRadius: 4, arrivalThreshold: 2 }

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach((follower, i) => {
    const ai = ais[i]
    if (follower.position.distanceTo(playerMesh.position) > 2) {
      follower.followLeader(playerMesh, followers, params.distance, params.separationRadius, params.maxSeparation, params.leaderSightRadius, params.arrivalThreshold)
      follower.lookWhereGoing(true)
      ai.keyboard.pressed.KeyW = true
    } else {
      follower.idle()
      follower.lookAt(playerMesh.position)
      ai.keyboard.pressed.KeyW = false
    }
    follower.update()
    ai.update(delta)
  })

  controls.update()
  player.update(delta)
  renderer.render(scene, camera)
}()
