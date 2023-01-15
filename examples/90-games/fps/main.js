import * as THREE from 'three'
import FirstPersonControls from './FirstPersonControls.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createSun } from '/utils/light.js'
import { createParticles, resetParticles, expandParticles } from '/utils/particles.js'
import { createCity } from '/utils/city.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'

const size = 2000

const ricochet = createParticles({ num: 100, size: 0.05, unitAngle: 0.2 })
scene.add(ricochet)

scene.fog = new THREE.FogExp2 (0x777788, 0.0055)
scene.add(createSun())

const controls = new FirstPersonControls(camera)
scene.add(controls.getObject())

const floor = createFloor({ size })
scene.add(floor)

const city = createCity({ numBuildings: 1000, size: size * .5, addWindows: false, colorParams: { colorful: .035, max: 1 } })
scene.add(city)

const fpsRenderer = new FPSRenderer({ targetY: 0.5 })

/* FUNCTIONS */

const raycaster = new THREE.Raycaster(
  camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))

function shoot(e) {
  raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
  const intersects = raycaster.intersectObject(city)
  if (intersects.length) {
    const intersect = intersects[0]
    resetParticles({ particles: ricochet, pos: intersect.point, unitAngle: 0.2 })
  }
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

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true
    instructions.style.display = 'none'
  } else {
    controls.enabled = false
    instructions.style.display = '-webkit-box'
  }
})

instructions.addEventListener('click', () => document.body.requestPointerLock())

document.body.addEventListener('click', shoot)
