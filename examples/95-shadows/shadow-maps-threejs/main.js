import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { dirLight } from '/utils/light.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'

const plane = createFloor()
scene.add(plane)

dirLight({ position: [12, 8, 1], intensity: 1.5 })

const { mesh, animations } = await loadSorceress()
const player = new StateMachine({ mesh, animations, dict: sorceressAnimations })
scene.add(mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
