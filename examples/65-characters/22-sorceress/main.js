import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations } = await loadSorceress()
const stateMachine = new StateMachine({ mesh, animations, dict: sorceressAnimations, useJoystick: true })

scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
