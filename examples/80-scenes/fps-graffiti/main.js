import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { createGraffitiCity } from '/utils/city.js'
import PointerLockControls from './PointerLockControls.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { getCameraIntersects } from '/utils/helpers.js'
import Particles from '/utils/classes/Particles.js'

const mapSize = 200

const ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })
scene.add(ricochet.mesh)

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createMoon())
scene.background = new THREE.Color(0x070b34)

const controls = new PointerLockControls(camera)
scene.add(controls.mesh)

const fpsRenderer = new FPSRenderer({ targetY: 0.5 })

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
  if (!document.pointerLockElement) return

  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  controls.update(delta)
  fpsRenderer.renderTarget()
  fpsRenderer.drawWeapon(time)

  ricochet.expand({ scalar: 1.2, maxRounds: 5, gravity: .02 })
}()

const city = await createGraffitiCity({ scene, mapSize })
scene.add(city)

/* FUNCTIONS */

function shoot() {
  const intersects = getCameraIntersects(camera, city)
  if (intersects.length)
    ricochet.reset({ pos: intersects[0].point, unitAngle: 0.2 })
}

/* EVENTS */

const instructions = document.querySelector('#instructions')

instructions.addEventListener('click', () => document.body.requestPointerLock())

document.addEventListener('pointerlockchange', () => {
  instructions.style.display = document.pointerLockElement ? 'none' : '-webkit-box'
})

document.body.addEventListener('click', shoot)
