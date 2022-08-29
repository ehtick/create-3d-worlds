import * as THREE from 'three'

import { scene, renderer, camera, clock, addUIControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import { keyboard } from '/utils/classes/Keyboard.js'

import StateMachine from '/utils/fsm/StateMachine.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { kachujinAnimations, kachujinKeys } from '/data/animations.js'

// dodati kameru (orbit ili 3rd), mozda dugme za promenu kamere
const h1 = document.getElementById('move')
const toggle = document.getElementById('checkbox')

const moves = Object.keys(kachujinKeys)
let stateMachine
let lastTime = 0
let autoplay = toggle.checked = true

const light = initLights()

scene.add(createGround({ size: 100, color: 0xF2D16B }))

addUIControls({ commands: kachujinKeys, title: '' })

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 3, axis: [0, 1, 0], angle: Math.PI })

/* FUNCTIONS */

const requestWakeLock = async() => {
  try {
    await navigator.wakeLock.request('screen')
  } catch (err) {
    console.error(`${err.name}, ${err.message}`)
  }
}

const pressKey = (key, now, autoplay = false) => {
  if (stateMachine.currentState.name !== 'idle') return

  lastTime = now
  h1.innerHTML = kachujinKeys[key]

  if (autoplay) setTimeout(() => {
    keyboard.pressed[key] = true
    setTimeout(() => keyboard.reset(), 100)
  }, 500)

  setTimeout(() => {
    h1.innerHTML = ''
  }, 2500)

  requestWakeLock()
}

const updateCamera = () => {
  if (keyboard.pressed.Digit1) {
    camera.position.z = 4
    light.position.z = 40
  }
  if (keyboard.pressed.Digit2) {
    camera.position.z = -6
    light.position.z = -40
  }
  camera.lookAt(new THREE.Vector3(0, 2, 0))
}

/* LOOP */

void function loop(now) {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  updateCamera()

  const key = Object.keys(keyboard.pressed)[0]

  if (kachujinKeys[key])
    pressKey(key, now)
  else if (autoplay && now - lastTime >= 8000)
    pressKey(sample(moves), now, true)

  stateMachine?.update(delta)
  renderer.render(scene, camera)
}()

/* EVENTS */

toggle.addEventListener('click', () => {
  autoplay = !autoplay
})

/* DEFFER LOAD */

const animations = await loadFbxAnimations(kachujinAnimations, 'character/kachujin/')
stateMachine = new StateMachine({ mesh, animations, animKeys: kachujinKeys })

scene.add(mesh)