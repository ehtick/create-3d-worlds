import { binaryTreeMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { hemLight } from '/utils/light.js'

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const matrix = binaryTreeMatrix(10)
const maze = meshFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
