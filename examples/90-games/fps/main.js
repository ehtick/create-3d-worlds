import * as THREE from 'three'
import FirstPersonControls from './FirstPersonControls.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createSun } from '/utils/light.js'
import { createParticles, resetParticles, expandParticles } from '/utils/particles.js'
import { createBox } from '/utils/geometry.js'

const particles = createParticles({ num: 100, size: 0.25, unitAngle: 0.2 })
scene.add(particles)

scene.fog = new THREE.FogExp2 (0x777788, 0.0055)
scene.add(createSun())

const raycaster = new THREE.Raycaster(
  camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))

const controls = new FirstPersonControls(camera)
scene.add(controls.getObject())

const floor = createFloor({ size: 2000 })
scene.add(floor)

// city
const city = new THREE.Group()
for (let i = 0; i < 500; i++) {
  const mesh = createBox({ width: 20, height: Math.random() * 80 + 10, depth: 20 })
  mesh.position.set(Math.random() * 1600 - 800, 0, Math.random() * 1600 - 800)
  city.add(mesh)
}
scene.add(city)

function makeParticles(position) {
  resetParticles({ particles, pos: position, unitAngle: 0.2 })
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  if (!controls.enabled) return

  controls.update()
  expandParticles({ particles, scalar: 1.2, maxRounds: 20, gravity: .02 })

  renderer.render(scene, camera)
}()

/* EVENTS */

const instructions = document.querySelector('#instructions')

document.addEventListener('pointerlockchange', e => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true
    instructions.style.display = 'none'
  } else {
    controls.enabled = false
    instructions.style.display = '-webkit-box'
  }
})

instructions.addEventListener('click', () => document.body.requestPointerLock())

document.body.addEventListener('click', e => {
  raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
  const intersects = raycaster.intersectObjects(city.children)
  if (intersects.length > 0) {
    const intersect = intersects[0]
    makeParticles(intersect.point)
  }
})
