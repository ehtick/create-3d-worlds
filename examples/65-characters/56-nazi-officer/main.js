import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { naziOfficerAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/nazi-officer/model.fbx', angle: Math.PI, fixColors: true })
const stateMachine = new StateMachine({ mesh, prefix: 'character/nazi-officer/', dict: naziOfficerAnimations })

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
