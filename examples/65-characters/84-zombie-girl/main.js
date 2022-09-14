import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { zombieGirlAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/zombie-girl/zombie-girl.fbx', angle: Math.PI, computeNormals: true })
const stateMachine = new StateMachine({ mesh, prefix: 'character/zombie-girl/', dict: zombieGirlAnimations })

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
