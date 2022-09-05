import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { mawLaygoAnimations } from '/data/animations.js'

initLights()

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/maw_j_laygo/maw_j_laygo.fbx', angle: Math.PI, axis: [0, 1, 0] })
const animations = await loadFbxAnimations(mawLaygoAnimations, 'character/maw_j_laygo/')
const stateMachine = new StateMachine({ mesh, animations, dict: mawLaygoAnimations })

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
