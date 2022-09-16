import * as THREE from 'three'
import Avatar from '/utils/classes/Avatar.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { initLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'

initLight()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createGround({ size: 100 }))

const player = new Avatar({ camera })
scene.add(player.mesh)

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
