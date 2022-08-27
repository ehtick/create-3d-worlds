import { scene, renderer, camera, clock, addUIControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import { keyboard } from '/utils/classes/Keyboard.js'

import StateMachine from './StateMachine.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { kachujinAnimations, kachujinMoves } from '/data/animations.js'

initLights()

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 3, axis: [0, 1, 0], angle: Math.PI })

const animations = await loadFbxAnimations(kachujinAnimations, 'character/kachujin/')
const stateMachine = new StateMachine({ mesh, animations })

scene.add(mesh)

addUIControls({ commands: kachujinMoves })

const keys = Object.keys(kachujinMoves)

/* LOOP */

let last = 0
const h1 = document.getElementById('move')

void function loop(now) {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  // TODO: if automode
  if (now - last >= 8000) {
    last = now
    const key = sample(keys)
    keyboard.pressed[key] = true
    h1.innerHTML = kachujinMoves[key]
    setTimeout(() => keyboard.reset(), 100)
    setTimeout(() => {
      h1.innerHTML = ''
    }, 3000)
  }

  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
