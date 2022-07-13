import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'

const anims = ['idle', 'look', 'walk', 'jump', 'die']

camera.position.set(-1, 50, 250)

/* INIT */

const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
scene.add(ambient)

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(0, 1, 10)
scene.add(light)

const controls = createOrbitControls()
controls.target.set(0, 70, 0)

const { mesh, mixer } = await loadModel({ file: '/character/knight/tpose.fbx', texture: 'character/knight/texture.png' })
const animations = await loadFbxAnimations(anims, 'character/knight/')

scene.add(mesh)

const actions = animations.map(animation => {
  const action = mixer.clipAction(animation)
  if (animation.name == 'die') {
    action.loop = THREE.LoopOnce
    action.clampWhenFinished = true
  }
  return action
})

playAction('idle')

/* FUNCTIONS */

function playAction(name) {
  const action = actions.find(a => a.getClip().name == name)
  mixer.stopAllAction()
  action.reset()
  action.fadeIn(0.5)
  action.play()
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  controls.update()
  const dt = clock.getDelta()
  mixer.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

Array.from(document.getElementById('btns').children).forEach((btn, i) => {
  btn.addEventListener('click', () => playAction(btn.textContent))
})
