import * as THREE from '/node_modules/three127/build/three.module.js'
import StateMachine from './StateMachine.js'

import { scene, renderer, camera, clock, addUIControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { kachujinAnimations, kachujinMoves } from '/data/animations.js'

initLights()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 3, axis: [0, 1, 0], angle: Math.PI })

const animations = await loadFbxAnimations(kachujinAnimations, 'character/kachujin/')

const stateMachine = new StateMachine({ mesh, animations })

scene.add(mesh)

addUIControls({ commands: kachujinMoves })

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
