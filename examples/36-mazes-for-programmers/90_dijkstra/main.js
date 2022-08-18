import Grid from '../mazes/Grid.js'
import BinaryTree from '../mazes/algorithms/BinaryTree.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createMazeMesh } from '/utils/mazes.js'

const grid = new Grid(8, 8)
BinaryTree.on(grid)
const first_cell = grid.cell(0, 0)
grid.distances = first_cell.distances.path_to(grid.cell(4, 4))
const matrix = grid.toMatrix()

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
