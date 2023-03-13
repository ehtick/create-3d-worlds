import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { createGraffitiCity } from '/utils/city.js'
import FPSPlayer from '/utils/player/FPSPlayer.js'

const mapSize = 200

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createMoon())
scene.background = new THREE.Color(0x070b34)

const player = new FPSPlayer({ camera, pointerLockId: 'instructions' })
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
  if (!document.pointerLockElement) return

  const delta = clock.getDelta()
  player.update(delta)
}()

const city = await createGraffitiCity({ scene, mapSize })
scene.add(city)

player.addSolids(city)
