import PlayerFSM from '/utils/fsm/PlayerFSM.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { goblinAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'model.fbx', angle: Math.PI, animNames: goblinAnimations, prefix: 'character/goblin/', size: 1.5, fixColors: true })
const stateMachine = new PlayerFSM({ mesh, animations, dict: goblinAnimations })

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
