import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { partisan2Animations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/partisan2/model.fbx', angle: Math.PI, size: .5 })
// TODO: pucanje da se ponavlja animacija dok je pritisnuto
const stateMachine = new StateMachine({ mesh, prefix: 'character/partisan2/', dict: partisan2Animations })

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
