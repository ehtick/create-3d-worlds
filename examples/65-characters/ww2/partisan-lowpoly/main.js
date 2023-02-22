import * as THREE from 'three'
import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadRifle, loadPartisanLowpoly } from '/utils/loaders.js'

createOrbitControls()

scene.add(createSun())
scene.add(createGround({ size: 100 }))

const { mesh, animations, animDict } = await loadPartisanLowpoly()

const player = new Player({ mesh, animations, animDict, useJoystick: true })
scene.add(mesh)

const { mesh: weapon } = await loadRifle()
player.addWeapon(weapon)

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
