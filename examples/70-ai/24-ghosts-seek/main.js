import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { createBall, createBox } from '/utils/geometry.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

const floor = createFloor({ size: 100 })
scene.add(floor)

const { mesh, animations } = await loadRobotko()
const player = new StateMachine({ mesh, animations, dict: robotAnimations })
scene.add(mesh)

const { mesh: ghostMesh, animations: ghostAnimations } = await loadModel({ file: 'character/ghost/scene.gltf' })

const mixers = []

function createMixer(mesh) {
  const mixer = new THREE.AnimationMixer(mesh)
  const action = mixer.clipAction(ghostAnimations[0])
  action.play()
  return mixer
}

const ghostMesh1 = SkeletonUtils.clone(ghostMesh)
const entity1 = new SteeringEntity(ghostMesh1)
entity1.position.set(randFloatSpread(50), 0, randFloatSpread(50))
scene.add(entity1)
mixers.push(createMixer(ghostMesh1))

const ghostMesh2 = SkeletonUtils.clone(ghostMesh)
const entity2 = new SteeringEntity(ghostMesh2)
entity2.position.set(randFloatSpread(50), 0, randFloatSpread(50))
scene.add(entity2)
mixers.push(createMixer(ghostMesh2))

const ghostMesh3 = SkeletonUtils.clone(ghostMesh)
const entity3 = new SteeringEntity(ghostMesh3)
entity3.position.set(randFloatSpread(50), 0, randFloatSpread(50))
scene.add(entity3)
mixers.push(createMixer(ghostMesh3))

entity1.maxSpeed = entity2.maxSpeed = entity3.maxSpeed = .05

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  controls.update()

  if (entity1.position.distanceTo(mesh.position) > 1) {
    entity1.seek(mesh.position)
    entity1.lookWhereGoing(true)
  } else {
    entity1.idle()
    entity1.lookAt(mesh.position)
  }

  if (entity2.position.distanceTo(mesh.position) > 2) {
    entity2.seek(mesh.position)
    entity2.lookWhereGoing(true)
  } else {
    entity2.idle()
    entity2.lookAt(mesh.position)
  }

  if (entity3.position.distanceTo(mesh.position) > 3) {
    entity3.seek(mesh.position)
    entity3.lookWhereGoing(true)
  } else {
    entity3.idle()
    entity3.lookAt(mesh.position)
  }

  entity1.update()
  entity2.update()
  entity3.update()
  player.update(delta)
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()
