import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { barbarianAnimations } from '/data/animations.js'

createOrbitControls()

scene.add(createSun())
scene.add(createFloor({ size: 100 }))

const { mesh, animations, animDict } = await loadModel({ prefix: 'character/barbarian/', file: 'model.fbx', angle: Math.PI, fixColors: true, animDict: barbarianAnimations })

const player = new Player({ mesh, animations, animDict })

scene.add(mesh)

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
