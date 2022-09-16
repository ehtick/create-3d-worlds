import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { ironGiantAnimations } from '/data/animations.js'

scene.add(createSun())

camera.position.set(0, 4, 8)
scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/iron-giant/model.fbx', angle: Math.PI, size: 5 })
const stateMachine = new StateMachine({ mesh, prefix: 'character/iron-giant/', dict: ironGiantAnimations })

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
