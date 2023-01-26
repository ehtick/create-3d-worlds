import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { createParticles, resetParticles, expandParticles } from '/utils/particles.js'
import { addGraffitiCity } from '/utils/city.js'
import { FirstPersonControls } from './FirstPersonControls-hack.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { getCameraIntersects } from '/utils/helpers.js'

const mapSize = 200

const ricochet = createParticles({ num: 100, size: .05, unitAngle: 0.2 })
scene.add(ricochet)

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createMoon())
scene.background = new THREE.Color(0x070b34)

const controls = new FirstPersonControls(camera, renderer.domElement) // new FirstPersonControls(camera)
// scene.add(controls.yawObject)

const fpsRenderer = new FPSRenderer({ targetY: 0.5 })

/* FUNCTIONS */

function shoot() {
  const intersects = getCameraIntersects(camera)
  if (intersects.length) // TODO: ako je preblizu (intersects[0].point) da ne puca
  {
    console.log(controls.yawObject.position.distanceTo(intersects[0].point))
    resetParticles({ particles: ricochet, pos: intersects[0].point, unitAngle: 0.2 })
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
  // if (!document.pointerLockElement) return

  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  controls.update(delta)
  fpsRenderer.renderTarget()
  fpsRenderer.drawWeapon(time)

  expandParticles({ particles: ricochet, scalar: 1.2, maxRounds: 5, gravity: .02 })
}()

await addGraffitiCity({ scene, mapSize })

/* EVENTS */

const instructions = document.querySelector('#instructions')

instructions.addEventListener('click', () => {
  instructions.style.display = 'none'
  // document.body.requestPointerLock()
})

// document.addEventListener('pointerlockchange', () => {
//   instructions.style.display = document.pointerLockElement ? 'none' : '-webkit-box'
// })

// document.body.addEventListener('click', shoot)
