import * as THREE from 'three'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'
import { SteeringEntity } from '/libs/ThreeSteer.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

const { randFloatSpread } = THREE.MathUtils

const mapSize = 100

const mixers = []
const entities = []

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: mapSize }))

const { mesh: ghostMesh, animations: ghostAnims } = await loadModel({ file: 'character/ghost/scene.gltf' })

for (let i = 0; i < 20; i++) {
  const mesh = SkeletonUtils.clone(ghostMesh)
  const entity = new SteeringEntity(mesh)
  entity.maxSpeed = .03
  entity.position.set(randFloatSpread(mapSize), -.5, randFloatSpread(mapSize))
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

  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()