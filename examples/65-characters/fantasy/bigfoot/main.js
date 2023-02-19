import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { bigfootAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations, animDict } = await loadModel({ file: 'model.fbx', prefix: 'character/bigfoot/', angle: Math.PI, fixColors: true, animDict: bigfootAnimations })
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
