import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { barbarianAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh } = await loadModel({ file: 'character/barbarian/model.fbx', angle: Math.PI, fixColors: true })
const animations = await loadFbxAnimations(barbarianAnimations, 'character/barbarian/')
const player = new Player({ mesh, animations, animDict: barbarianAnimations })

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
