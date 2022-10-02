import PlayerFSM from '/utils/fsm/PlayerFSM.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { zombieGirlAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'model.fbx', prefix: 'character/zombie-girl/', angle: Math.PI, fixColors: true, animNames: zombieGirlAnimations })
const stateMachine = new PlayerFSM({ mesh, animations, dict: zombieGirlAnimations })

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
