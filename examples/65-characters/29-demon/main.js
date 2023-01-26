import Player from '/utils/fsm/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { demonAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/demon/demon.fbx', angle: Math.PI, fixColors: true })
const animations = await loadFbxAnimations(demonAnimations, 'character/demon/')
const player = new Player({ mesh, animations, dict: demonAnimations })

scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
