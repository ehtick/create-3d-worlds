import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { treemanAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/treeman/', angle: Math.PI, fixColors: true, animDict: treemanAnimations })
const player = new Player({ mesh, animations, animDict })

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
