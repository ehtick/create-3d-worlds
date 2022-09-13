import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadLowPoly } from '/utils/loaders.js'
import { shieldmaidenAnimation } from '/data/animations.js'

initLights()

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadLowPoly({ animNames: shieldmaidenAnimation, prefix: 'character/lowpoly/shieldmaiden/' })
const stateMachine = new StateMachine({ mesh, animations, dict: shieldmaidenAnimation })

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
