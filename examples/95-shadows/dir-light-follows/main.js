import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createBox } from '/utils/geometry.js'

import StateMachine from '/utils/fsm/StateMachine.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'
import { dirLight, lightFollow } from '/utils/light.js'

camera.position.y = 15
createOrbitControls()

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

const radius = 5

for (let degree = 0; degree <= 2 * Math.PI; degree += Math.PI / 6) {
  const cube = createBox({ height: 3, color: 'white', castShadow: true, receiveShadow: true })
  cube.position.set(Math.cos(degree) * radius, 0, Math.sin(degree) * radius)
  cube.rotation.y = -degree
  scene.add(cube)
}

const plane = createGround({ size: 20 })
scene.add(plane)

const { mesh, animations } = await loadSorceress()
const player = new StateMachine({ mesh, animations, dict: sorceressAnimations })
scene.add(mesh)

const light = dirLight({ target: mesh, mapSize: 1024, area: 10 })

/* LOOP */

void function loop() {
  lightFollow(light, mesh, [12, 18, 1])

  const delta = clock.getDelta()
  player.update(delta)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()