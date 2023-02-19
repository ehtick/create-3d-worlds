import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import Player from '/utils/player/Player.js'
import { loadDupechesh } from '/utils/loaders.js'
import { dupecheshAnimations } from '/data/animations.js'
import { createGround } from '/utils/ground.js'
import { dirLight } from '/utils/light.js'

dirLight()

createOrbitControls()
camera.position.set(0, 2, 3)

const { mesh, animations } = await loadDupechesh()
const player = new Player({ mesh, animations, animDict: dupecheshAnimations })
scene.add(mesh)

const ground = createGround({ size: 10 })
scene.add(ground)

// LOOP

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
