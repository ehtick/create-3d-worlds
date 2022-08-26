import * as THREE from 'three'
import Player from './Player.js'
import StateMachine from './StateMachine.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { girlAnimations } from '/data/animations.js'
import keyboard from '/utils/classes/Keyboard.js'

initLights()
const controls = createOrbitControls()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 2, angle: Math.PI, axis: [0, 1, 0] })
const animations = await loadFbxAnimations(girlAnimations, 'character/kachujin/')

const mixer = new THREE.AnimationMixer(mesh)

const actions = animations.reduce((dict, clip) => ({
  ...dict,
  [clip.name]: mixer.clipAction(clip)
}), {})

const player = new Player({ mesh })
const stateMachine = new StateMachine(actions)

scene.add(mesh)

const thirdPersonCamera = new ThirdPersonCamera({ camera, mesh, offset: [0, 2, 3], lookAt: [0, 2, 0] })
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  mixer.update(delta)
  stateMachine.update()

  if (!keyboard.pressed.mouse)
    thirdPersonCamera.update(delta)

  renderer.render(scene, camera)
}()
