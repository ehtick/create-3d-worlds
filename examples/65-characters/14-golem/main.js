import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { golemAnimation } from '/data/animations.js'

initLights()

camera.position.set(0, 4, 8)
scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'model.fbx', angle: Math.PI, computeNormals: true, animNames: golemAnimation, prefix: 'character/golem/', size: 5 })
const stateMachine = new StateMachine({ mesh, animations, dict: golemAnimation })

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
