import * as THREE from 'three'
import StateMachine from '/utils/fsm/StateMachine.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js'

import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadKachujin, loadMawLaygo } from '/utils/loaders.js'
import { girlAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

const mixers = []
const followers = []

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh: playerMesh, animations } = await loadKachujin()
const player = new StateMachine({ mesh: playerMesh, animations, dict: girlAnimations })
playerMesh.velocity = new THREE.Vector3() // required for steer

scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadMawLaygo({ angle: 0 })

for (let i = 0; i < 10; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  mesh.position.set(randFloatSpread(50), 0, randFloatSpread(50))
  scene.add(mesh)

  const mixer = new THREE.AnimationMixer(mesh)
  const action = mixer.clipAction(followerAnims[1])
  action.startAt(Math.random() * action.getClip().duration)
  action.play()
  mixers.push(mixer)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach(follower => {
    console.log(follower)
  })

  controls.update()
  player.update(delta)
  mixers.forEach(mixer => mixer.update(delta))
  renderer.render(scene, camera)
}()
