import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadLowPoly } from '/utils/loaders.js'
import { shieldmaidenAnimation } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadLowPoly({ animDict: shieldmaidenAnimation, prefix: 'character/shieldmaiden/' })
const player = new Player({ mesh, animations, animDict: shieldmaidenAnimation })

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
