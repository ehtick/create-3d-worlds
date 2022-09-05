import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { loadModel } from '/utils/loaders.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import { dupecheshAnimations } from '/data/animations.js'
import { createGround } from '/utils/ground.js'
import { dirLight } from '/utils/light.js'

dirLight({ intensity: 1.5 })
const controls = createOrbitControls()
camera.position.set(0, 2, 3)

const { mesh, animations } = await loadModel({ file: 'character/ogro/ogro.md2', texture: 'character/ogro/skins/arboshak.png', size: 2, axis: [0, 1, 0], angle: Math.PI * .5, shouldCenter: true, shouldAdjustHeight: true })

const player = new StateMachine({ mesh, animations, dict: dupecheshAnimations })
scene.add(mesh)

controls.target = mesh.position

const ground = createGround({ size: 10 })
scene.add(ground)

// LOOP

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
