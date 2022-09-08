import * as THREE from 'three'
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

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

scene.add(createFloor({ size: 100 }))

const { mesh: playerMesh, animations } = await loadKachujin()
const player = new StateMachine({ mesh: playerMesh, animations, dict: girlAnimations })
scene.add(playerMesh)

const { mesh: followerMesh, animations: followerAnims } = await loadMawLaygo()

for (let i = 0; i < 10; i++) {
  const mesh = SkeletonUtils.clone(followerMesh)
  mesh.position.set(randFloatSpread(50), 0, randFloatSpread(50))
  const ai = new StateMachine({ mesh, animations: followerAnims, dict: mawLaygoAnimations, keyboard: new Keyboard(false) })
  ai.randomizeAction()
  followers.push(ai)
  scene.add(mesh)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  followers.forEach(follower => {
    // follower.keyboard.pressed.KeyW = true
    follower.update(delta)
  })

  controls.update()
  player.update(delta)
  renderer.render(scene, camera)
}()
