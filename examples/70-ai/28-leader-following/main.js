import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { createBox } from '/utils/geometry.js'
import { getMouseIntersects } from '/utils/helpers.js'

const { randInt, randFloat } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 10)

const floor = createFloor({ size: 100 })
scene.add(floor)

const whiteBox = createBox({ height: 2 })
const leader = new SteeringEntity(whiteBox)
leader.maxSpeed = .1
leader.position.set(randInt(-25, 25), 0, randInt(-25, 25))
leader.wanderDistance = .5
leader.wanderRadius = .25
leader.wanderRange = .05
scene.add(leader)

const followers = []
for (let i = 0; i < 20; i++) {
  const mesh = createBox({ height: 2, color: 0x000000 })
  const entity = new SteeringEntity(mesh)
  entity.position.set(randInt(-25, 25), 0, randInt(-25, 25))
  entity.maxSpeed = .075,
  followers.push(entity)
  scene.add(entity)
}

const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

const params = { distance: 4, separationRadius: 3, maxSeparation: 5, leaderSightRadius: 10, arrivalThreshold: 2 }

void function animate() {
  requestAnimationFrame(animate)
  controls.update()

  leader.wander()
  leader.lookWhereGoing(true)
  leader.update()
  leader.bounce(boundaries)

  followers.forEach(follower => {
    follower.followLeader(leader, followers, params.distance, params.separationRadius, params.maxSeparation, params.leaderSightRadius, params.arrivalThreshold)
    follower.lookWhereGoing(true)
    follower.update()
    follower.bounce(boundaries)
  })

  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('mousedown', onClick, true)

function onClick(e) {
  const intersects = getMouseIntersects(e, camera, scene)
  if (intersects.length > 0) {
    const { x, y, z } = intersects[0].point
    leader.position.set(x, y, z)
  }
}
