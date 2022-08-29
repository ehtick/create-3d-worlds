import Player from './Player.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { girlAnimations } from '/data/animations.js'

initLights()

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/kachujin/Kachujin.fbx', size: 2, angle: Math.PI, axis: [0, 1, 0] })
const animations = await loadFbxAnimations(girlAnimations, 'character/kachujin/')
const stateMachine = new StateMachine({ mesh, animations })

const player = new Player({ mesh })
scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  stateMachine.update(delta)

  renderer.render(scene, camera)
}()
