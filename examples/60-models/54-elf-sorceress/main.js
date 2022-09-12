import StateMachine from '/utils/fsm/StateMachine.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { elfSorceressAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/elf-sorceress/model.fbx', angle: Math.PI, computeNormals: true })
const animations = await loadFbxAnimations(elfSorceressAnimations, 'character/elf-sorceress/')
const stateMachine = new StateMachine({ mesh, animations, dict: elfSorceressAnimations })

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
