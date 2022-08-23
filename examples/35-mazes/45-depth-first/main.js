import { recursiveBacktrackerMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { material } from '/utils/shaders/texture.js'
import { hemLight } from '/utils/light.js'

const matrix = recursiveBacktrackerMatrix(20)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix, material })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
