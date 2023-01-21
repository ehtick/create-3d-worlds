import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createSun } from '/utils/light.js'
import { createParticles, resetParticles, expandParticles } from '/utils/particles.js'
import { createLampposts, createCity } from '/utils/city.js'
import FirstPersonControls from './FirstPersonControls.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { getCameraIntersects } from '/utils/helpers.js'

const size = 500
const numBuildings = 200
const numLampposts = 8 // max lights is 16

const ricochet = createParticles({ num: 100, size: 0.05, unitAngle: 0.2 })
scene.add(ricochet)

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createSun({ position: [50, 100, 50], sunColor: 0xF6F1D5, r: 4 }))
scene.background = new THREE.Color(0x070b34)

const controls = new FirstPersonControls(camera)
scene.add(controls.getObject())

const floor = createFloor({ size: size * 1.1, color: 0x606068 })

const lampposts = createLampposts({ size, numLampposts, circle: false })
scene.add(lampposts)

const city = createCity({ numBuildings, size, circle: false, colorParams: { colorful: .035, max: 1 } })
scene.add(floor, city)

const fpsRenderer = new FPSRenderer({ targetY: 0.5 })

/* FUNCTIONS */

function shoot() {
  const intersects = getCameraIntersects(camera, city)
  if (intersects.length)
    resetParticles({ particles: ricochet, pos: intersects[0].point, unitAngle: 0.2 })
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
  if (!document.pointerLockElement) return

  const delta = clock.getDelta()
  controls.update(delta)
  fpsRenderer.renderTarget()
  expandParticles({ particles: ricochet, scalar: 1.2, maxRounds: 20, gravity: .02 })
}()

/* EVENTS */

const instructions = document.querySelector('#instructions')

instructions.addEventListener('click', () => document.body.requestPointerLock())

document.addEventListener('pointerlockchange', () => {
  instructions.style.display = document.pointerLockElement ? 'none' : '-webkit-box'
})

document.body.addEventListener('click', shoot)
