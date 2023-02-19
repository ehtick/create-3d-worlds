import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadIronGiant } from '/utils/loaders.js'

scene.add(createSun())

camera.position.set(0, 4, 8)
scene.add(createFloor({ size: 100 }))

const { mesh, animations, animDict } = await loadIronGiant()
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
