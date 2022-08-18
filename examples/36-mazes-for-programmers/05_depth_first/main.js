import { recursiveBacktracker } from '../mazes/algorithms/RecursiveBacktracker.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createMazeMesh } from '/utils/mazes.js'

const matrix = recursiveBacktracker(20)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = createMazeMesh({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
