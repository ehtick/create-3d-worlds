import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { pyramidFromMatrix } from '/utils/mazes.js'
import { huntAndKillMatrix } from '/utils/mazes/algorithms.js'
import { hemLight } from '/utils/light.js'

const matrix = huntAndKillMatrix(20)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = pyramidFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
