import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'

import StateMachine from '/utils/fsm/StateMachine.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'
import { createStoneCircles } from '/utils/geometry/towers.js'
import { createSun } from '/utils/light.js'

camera.position.y = 15
createOrbitControls()

const light = createSun()
scene.add(light)

const stones = createStoneCircles()
scene.add(stones)

const plane = createGround({ size: 20 })
scene.add(plane)

const { mesh, animations } = await loadSorceress()
const player = new StateMachine({ mesh, animations, dict: sorceressAnimations })
scene.add(mesh)

/* LOOP */

const lightRadius = 8
let lightAngle = 0

void function loop() {
  lightAngle += .003
  const x = Math.cos(lightAngle) * lightRadius
  const z = Math.sin(lightAngle) * lightRadius
  light.position.set(x, 10, z)

  const delta = clock.getDelta()
  player.update(delta)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()