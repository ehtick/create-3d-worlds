import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'
import Player from '/utils/fsm/Player.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

const mixers = []
const entities = []
const GHOST_NUM = 4

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadRobotko()
const player = new Player({ mesh, animations, dict: robotkoAnimations })
scene.add(mesh)

const { mesh: ghostMesh, animations: ghostAnims } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < GHOST_NUM; i++) {
  const clonedMesh = SkeletonUtils.clone(ghostMesh)
  const entity = new SteeringEntity(clonedMesh)
  entity.position.set(randFloatSpread(50), -.5, randFloatSpread(50))
  entity.maxSpeed = .05
  entities.push(entity)
  scene.add(entity)

  const mixer = new THREE.AnimationMixer(clonedMesh)
  const action = mixer.clipAction(ghostAnims[0])
  action.startAt(Math.random() * action._clip.duration)
  action.play()
  mixers.push(mixer)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  entities.forEach(entity => {
    if (entity.position.distanceTo(mesh.position) > 1) {
      entity.seek(mesh.position)
      entity.lookWhereGoing(true)
    } else {
      entity.idle()
      entity.lookAt(mesh.position)
    }
    entity.update()
  })

  controls.update()
  player.update(delta)
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()
