import * as THREE from '/node_modules/three/build/three.module.js'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

let model, neck, waist, mixer, idle

initLights()
camera.position.set(0, -3, 30)

const loader = new GLTFLoader()
const texture = new THREE.TextureLoader().load('stacy.jpg')
texture.flipY = false

const stacy_mtl = new THREE.MeshPhongMaterial({
  map: texture,
  skinning: true
})

loader.load('stacy_lightweight.glb', gltf => {
  model = gltf.scene
  const fileAnimations = gltf.animations

  model.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true
      o.receiveShadow = true
      o.material = stacy_mtl
    }
    if (o.isBone && o.name === 'mixamorigNeck')
      neck = o
    if (o.isBone && o.name === 'mixamorigSpine')
      waist = o
  })

  model.scale.set(7, 7, 7)
  model.position.y = -11

  scene.add(model)

  mixer = new THREE.AnimationMixer(model)

  const idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle')
  idleAnim.tracks.splice(3, 3)
  idleAnim.tracks.splice(9, 3)
  idle = mixer.clipAction(idleAnim)
  idle.play()
})

const floor = createFloor({ color: 0xeeeeee })
floor.position.y = -11
scene.add(floor)

document.addEventListener('mousemove', e => {
  const mousecoords = getMousePos(e)
  if (neck && waist) {
    moveJoint(mousecoords, neck, 50)
    moveJoint(mousecoords, waist, 30)
  }
})

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}

function moveJoint(mouse, joint, degreeLimit) {
  const degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  joint.rotation.y = THREE.Math.degToRad(degrees.x)
  joint.rotation.x = THREE.Math.degToRad(degrees.y)
}

function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage

  const w = { x: window.innerWidth, y: window.innerHeight }
  // Left (Rotates neck left between 0 and -degreeLimit)
  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = xdiff / (w.x / 2) * 100
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = degreeLimit * xPercentage / 100 * -1
  }

  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2
    xPercentage = xdiff / (w.x / 2) * 100
    dx = degreeLimit * xPercentage / 100
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y
    yPercentage = ydiff / (w.y / 2) * 100
    // Note that I cut degreeLimit in half when she looks up
    dy = degreeLimit * 0.5 * yPercentage / 100 * -1
  }
  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2
    yPercentage = ydiff / (w.y / 2) * 100
    dy = degreeLimit * yPercentage / 100
  }
  return { x: dx, y: dy }
}

/* LOOP */

function update() {
  if (mixer)
    mixer.update(clock.getDelta())

  renderer.render(scene, camera)
  requestAnimationFrame(update)
}

update()
