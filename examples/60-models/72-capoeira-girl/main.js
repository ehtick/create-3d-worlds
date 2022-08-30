import * as THREE from 'three'
import { scene, renderer, camera, clock, addUIControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import { keyboard } from '/utils/classes/Keyboard.js'

import StateMachine from '/utils/fsm/StateMachine.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { kachujinAnimations, kachujinKeys } from '/data/animations.js'

const moveName = document.getElementById('move')
const toggleBtn = document.getElementById('checkbox')

let stateMachine, lastKey, lastTime = 0
let autoplay = toggleBtn.checked = true

const light = initLights()
camera.position.set(0, 1, 3)

scene.add(createGround({ size: 100, color: 0xF2D16B }))

addUIControls({ commands: kachujinKeys, title: '' })

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', axis: [0, 1, 0], angle: Math.PI })

scene.add(mesh)

/* FUNCTIONS */

const pressKey = async(key, now, simulateKey = false) => {
  if (stateMachine.currentState.name !== 'idle') return

  lastTime = now
  lastKey = key
  moveName.innerHTML = kachujinKeys[key]

  if (simulateKey) setTimeout(() => {
    keyboard.pressed[key] = true
    setTimeout(() => keyboard.reset(), 100)
  }, 500)

  setTimeout(() => {
    moveName.innerHTML = ''
  }, 2500)

  await navigator.wakeLock?.request('screen')
}

/* LOOP */

void function loop(now) {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  const key = Object.keys(keyboard.pressed)[0]

  if (kachujinKeys[key])
    pressKey(key, now)
  else if (now - lastTime >= 7500)
    if (autoplay) pressKey(sample(Object.keys(kachujinKeys)), now, true)
    else if (lastKey) pressKey(lastKey, now, true)

  stateMachine?.update(delta)
  renderer.render(scene, camera)
}()

/* EVENTS */

toggleBtn.addEventListener('click', () => {
  autoplay = !autoplay
  lastKey = null
})

document.getElementById('camera').addEventListener('click', () => {
  light.position.z = -light.position.z
  camera.position.z = light.position.z < 0 ? -4.5 : 3
  camera.lookAt(new THREE.Vector3(0, camera.position.y, 0))
})

/* LATE LOAD */

const animations = await loadFbxAnimations(kachujinAnimations, 'character/kachujin/')
stateMachine = new StateMachine({ mesh, animations, animKeys: kachujinKeys })

document.getElementById('preloader').style.display = 'none'