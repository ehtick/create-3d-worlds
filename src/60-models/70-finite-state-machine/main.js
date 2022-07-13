import * as THREE from '/node_modules/three127/build/three.module.js'
import Player from './Player.js'
import StateMachine from './StateMachine.js'
import ThirdPersonCamera from '/classes/ThirdPersonCamera.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { girlAnimations } from '/data/animations.js'
import keyboard from '/classes/Keyboard.js'

camera.position.set(25, 10, 25)

initLights()
const controls = createOrbitControls()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 10 })
const animations = await loadFbxAnimations(girlAnimations, 'character/kachujin/')

const mixer = new THREE.AnimationMixer(mesh)

const actions = animations.reduce((dict, clip) => ({
  ...dict,
  [clip.name]: mixer.clipAction(clip)
}), {})

const player = new Player({ mesh })
const stateMachine = new StateMachine(actions)

scene.add(mesh)

const thirdPersonCamera = new ThirdPersonCamera({ camera, mesh })
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  mixer.update(delta)
  if (!keyboard.pressed.mouse) thirdPersonCamera.update(delta)
  stateMachine.update()

  renderer.render(scene, camera)
}()
