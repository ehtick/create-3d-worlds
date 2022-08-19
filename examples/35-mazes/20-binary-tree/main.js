import { binaryTree } from '../mazes/algorithms/BinaryTree.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const matrix = binaryTree(10)
const maze = meshFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
