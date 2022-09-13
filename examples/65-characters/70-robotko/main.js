import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import { createGround } from '/utils/ground.js'
import { robotkoAnimations } from '/data/animations.js'

dirLight({ intensity: 1.5 })

camera.position.set(0, 3, 5)
createOrbitControls()

const { mesh, animations } = await loadModel({ file: 'character/robotko/robot.glb', size: 1.2, angle: Math.PI })
const stateMachine = new StateMachine({ mesh, animations, dict: robotkoAnimations })

scene.add(mesh)

scene.add(createGround({ size: 100 }))

// LOOP

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  stateMachine.update(delta)
  renderer.render(scene, camera)
}()
