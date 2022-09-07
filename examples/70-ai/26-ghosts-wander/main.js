import * as THREE from 'three'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { SteeringEntity } from '/libs/ThreeSteer.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

const { randInt } = THREE.MathUtils

const mixers = []
const entities = []
const numEntities = 20

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh: ghostMesh, animations: ghostAnims } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < numEntities; i++) {
  const mesh = SkeletonUtils.clone(ghostMesh)
  const entity = new SteeringEntity(mesh)
  entity.maxSpeed = .05
  entity.position.set(randInt(-50, 50), -.5, randInt(-50, 50))
  entities.push(entity)
  scene.add(entity)

  const mixer = new THREE.AnimationMixer(mesh)
  mixers.push(mixer)
  const action = mixer.clipAction(ghostAnims[0])
  action.startAt(Math.random() * action._clip.duration)
  action.play()
}

const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  entities.forEach(entity => {
    entity.wander()
    entity.lookWhereGoing(true)
    entity.update()
    entity.bounce(boundaries)
  })

  controls.update()
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()