import { sideWinder } from '/utils/mazes/algorithms/SideWinder.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'

const matrix = sideWinder(10)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix, texture: 'walls/hedge_ivy.png' })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
