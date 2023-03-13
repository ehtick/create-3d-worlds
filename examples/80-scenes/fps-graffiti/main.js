import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { createMoon } from '/utils/light.js'
import { createGraffitiCity } from '/utils/city.js'
import FPSPlayer from '/utils/player/FPSPlayer.js'
import { getAllCoords } from '/utils/helpers.js'
import { loadModel } from '/utils/loaders.js'
import { animDict } from '/utils/actors/ww2/Partisan.js'

const mapSize = 200
const coords = getAllCoords({ mapSize })

scene.fog = new THREE.FogExp2(0xF6F1D5, 0.0055)
scene.add(createMoon())
scene.background = new THREE.Color(0x070b34)

/* PLAYER */

const { mesh, animations } = await loadModel({ file: 'partisan.fbx', angle: Math.PI, animDict, prefix: 'character/soldier/', fixColors: true, size: 1.8 })

const { mesh: rifle } = await loadModel({ file: 'weapon/rifle-berthier/model.fbx', scale: .60, angle: Math.PI })

const player = new FPSPlayer({ mesh, animations, animDict, rifle, camera, coords, pointerLockId: 'instructions' })
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  renderer.render(scene, camera)
  if (!document.pointerLockElement) return

  const delta = clock.getDelta()
  player.update(delta)
}()

const city = await createGraffitiCity({ scene, mapSize, coords })
scene.add(city)

player.addSolids(city)
