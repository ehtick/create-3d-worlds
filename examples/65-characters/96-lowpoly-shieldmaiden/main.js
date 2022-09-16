import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLight } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadLowPoly } from '/utils/loaders.js'
import { skeletonAnimation } from '/data/animations.js'

initLight()

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadLowPoly({ animNames: skeletonAnimation, prefix: 'character/skeleton/' })
const stateMachine = new StateMachine({ mesh, animations, dict: skeletonAnimation })

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
