import { scene, renderer, camera, clock, addUIControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import { keyboard } from '/utils/classes/Keyboard.js'

import StateMachine from './StateMachine.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { kachujinAnimations, kachujinMoves } from '/data/animations.js'

let lastTime = 0
const h1 = document.getElementById('move')
const moves = Object.keys(kachujinMoves)

initLights()

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 3, axis: [0, 1, 0], angle: Math.PI })

const animations = await loadFbxAnimations(kachujinAnimations, 'character/kachujin/')
const stateMachine = new StateMachine({ mesh, animations })

scene.add(mesh)

addUIControls({ commands: kachujinMoves })

/* FUNCTIONS */

const playAction = (key, now, autoplay = false) => {
  lastTime = now
  h1.innerHTML = kachujinMoves[key]

  if (autoplay) setTimeout(() => {
    keyboard.pressed[key] = true
    setTimeout(() => keyboard.reset(), 100)
  }, 500)

  setTimeout(() => {
    h1.innerHTML = ''
  }, 3000)
}

/* LOOP */

void function loop(now) {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  const keyPressed = Object.keys(keyboard.pressed)[0]

  if (kachujinMoves[keyPressed])
    playAction(keyPressed, now)
  else if (now - lastTime >= 8000)
    playAction(sample(moves), now, true)

  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
