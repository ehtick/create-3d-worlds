import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { skaterAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'model.fbx', prefix: 'character/skater-girl/', animNames: skaterAnimations, angle: Math.PI, fixColors: true })
const stateMachine = new StateMachine({ mesh, dict: skaterAnimations, animations })

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
