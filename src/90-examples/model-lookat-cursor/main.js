import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'

const textureLoader = new THREE.TextureLoader()

let neck, spine

initLights()
camera.position.set(0, 1.5, 3)

const texture = textureLoader.load('/assets/models/character/stacy/stacy.jpg')
texture.flipY = false

const stacy_mtl = new THREE.MeshPhongMaterial({
  map: texture,
  skinning: true
})

const { mesh: model, animations } = await loadModel('character/stacy/stacy.glb')

model.traverse(o => {
  if (o.isMesh)
    o.material = stacy_mtl
  if (o.isBone && o.name === 'mixamorigNeck')
    neck = o
  if (o.isBone && o.name === 'mixamorigSpine')
    spine = o
})

scene.add(model)

const mixer = new THREE.AnimationMixer(model)
const idleAnim = THREE.AnimationClip.findByName(animations, 'idle')
idleAnim.tracks.splice(3, 3)
idleAnim.tracks.splice(9, 3)
const idle = mixer.clipAction(idleAnim)
idle.play()

const floor = createFloor({ color: 0xeeeeee })
scene.add(floor)

const getMousePos = e => ({ x: e.clientX, y: e.clientY })

function mouseToDegrees(x, y, degreeMax) {
  let dx = 0, dy = 0
  const halfX = window.innerWidth / 2
  const halfY = window.innerHeight / 2

  const xdiff = x - halfX
  dx = degreeMax * xdiff / halfX

  const ydiff = y - halfY
  if (ydiff < 0) degreeMax *= 0.5
  dy = degreeMax * ydiff / halfY

  return { x: dx, y: dy }
}

function moveJoint(mouse, joint, degreeMax) {
  const degrees = mouseToDegrees(mouse.x, mouse.y, degreeMax)
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
  const mouse = getMousePos(e)
  moveJoint(mouse, neck, 50)
  moveJoint(mouse, spine, 40)
})
