import * as THREE from '/node_modules/three/build/three.module.js'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

let model, neck, spine, mixer, idle

initLights()
camera.position.set(0, 1.5, 3)

const loader = new GLTFLoader()
const texture = new THREE.TextureLoader().load('stacy.jpg')
texture.flipY = false

const stacy_mtl = new THREE.MeshPhongMaterial({
  map: texture,
  skinning: true
})

loader.load('stacy_lightweight.glb', gltf => {
  model = gltf.scene
  const { animations } = gltf

  model.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
      o.material = stacy_mtl
    }
    if (o.isBone && o.name === 'mixamorigNeck')
      neck = o
    if (o.isBone && o.name === 'mixamorigSpine')
      spine = o
  })

  scene.add(model)

  mixer = new THREE.AnimationMixer(model)
  const idleAnim = THREE.AnimationClip.findByName(animations, 'idle')
  console.log(idleAnim)
  idleAnim.tracks.splice(3, 3)
  idleAnim.tracks.splice(9, 3)
  idle = mixer.clipAction(idleAnim)
  idle.play()
})

const floor = createFloor({ color: 0xeeeeee })
scene.add(floor)

const getMousePos = e => ({ x: e.clientX, y: e.clientY })

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0

  const screen = { x: window.innerWidth, y: window.innerHeight }
  // 1. If cursor is in the left half of screen
  if (x <= screen.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    const xdiff = screen.x / 2 - x
    // 3. Find the percentage of that difference
    const xPercentage = xdiff / (screen.x / 2) * 100
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = degreeLimit * xPercentage / 100 * -1
  }

  if (x >= screen.x / 2) {
    const xdiff = x - screen.x / 2
    const xPercentage = xdiff / (screen.x / 2) * 100
    dx = degreeLimit * xPercentage / 100
  }

  if (y <= screen.y / 2) {
    const ydiff = screen.y / 2 - y
    const yPercentage = ydiff / (screen.y / 2) * 100
    dy = degreeLimit * 0.5 * yPercentage / 100 * -1
  }

  if (y >= screen.y / 2) {
    const ydiff = y - screen.y / 2
    const yPercentage = ydiff / (screen.y / 2) * 100
    dy = degreeLimit * yPercentage / 100
  }
  return { x: dx, y: dy }
}

function moveJoint(mouse, joint, degreeLimit) {
  const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  joint.rotation.y = THREE.Math.degToRad(degrees.x)
  joint.rotation.x = THREE.Math.degToRad(degrees.y)
}

/* LOOP */

void function update() {
  mixer?.update(clock.getDelta())
  renderer.render(scene, camera)
  requestAnimationFrame(update)
}()

/* EVENTS */

document.addEventListener('mousemove', e => {
  const mousecoords = getMousePos(e)
  if (neck && spine) {
    moveJoint(mousecoords, neck, 60)
    moveJoint(mousecoords, spine, 40)
  }
})

