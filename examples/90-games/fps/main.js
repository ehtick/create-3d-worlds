import * as THREE from 'three'
import { camera, scene, renderer, setBackground } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { hemLight, createSun } from '/utils/light.js'
import { createParticles, resetParticles, expandParticles } from '/utils/particles.js'
import { createLampposts, createCity, createCityLights } from '/utils/city.js'
import FirstPersonControls from './FirstPersonControls.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { getCameraIntersects } from '/utils/helpers.js'

const size = 400
const numBuildings = 200
const numLampposts = 4
const numCityLights = 16 - numLampposts // max num of lights is 16

const ricochet = createParticles({ num: 100, size: 0.05, unitAngle: 0.2 })
scene.add(ricochet)

scene.fog = new THREE.FogExp2 (0x777788, 0.0055)
hemLight({ intensity: 2 })
setBackground(0x070b34)

const controls = new FirstPersonControls(camera)
scene.add(controls.getObject())

const floor = createFloor({ size: size * 1.1, color: 0x101018 })
const lampposts = createLampposts({ size, numLampposts, circle: false })
const streetLights = createCityLights({ size, numLights: numCityLights })

// const city = createCity({ numBuildings, size, colorParams: { colorful: .035, max: 1 } })
const city = createCity({ numBuildings, size, circle: false, colorParams: null, rotateEvery: 9 })
scene.add(floor, city, lampposts, streetLights)

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
  if (!controls.enabled) return

  controls.update()
  fpsRenderer.renderTarget()
  expandParticles({ particles: ricochet, scalar: 1.2, maxRounds: 20, gravity: .02 })

  renderer.render(scene, camera)
}()

/* EVENTS */

const instructions = document.querySelector('#instructions')

instructions.addEventListener('click', () => document.body.requestPointerLock())

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true
    instructions.style.display = 'none'
  } else {
    controls.enabled = false
    instructions.style.display = '-webkit-box'
  }
})

document.body.addEventListener('click', shoot)
