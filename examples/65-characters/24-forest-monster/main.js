import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLight } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { forestMonsterAnimations } from '/data/animations.js'

initLight()

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'character/forest-monster/scene.gltf', angle: Math.PI })
const stateMachine = new StateMachine({ mesh, animations, dict: forestMonsterAnimations, camera })

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
