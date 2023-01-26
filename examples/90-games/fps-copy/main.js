import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { addGraffitiCity } from '/utils/city.js'
import { FirstPersonControls } from './FirstPersonControls-hack.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'

const mapSize = 200

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createMoon())
scene.background = new THREE.Color(0x070b34)

const controls = new FirstPersonControls(camera, renderer.domElement)

const fpsRenderer = new FPSRenderer({ targetY: 0.5 })

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)

  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  controls.update(delta)
  fpsRenderer.renderTarget()
  fpsRenderer.drawWeapon(time)
}()

await addGraffitiCity({ scene, mapSize })

/* EVENTS */

const instructions = document.querySelector('#instructions')

instructions.addEventListener('click', () => {
  instructions.style.display = 'none'
})
