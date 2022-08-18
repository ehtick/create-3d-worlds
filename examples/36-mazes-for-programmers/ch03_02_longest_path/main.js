import SideWinder from '../mazes/algorithms/SideWinder.js'
import Grid from '../mazes/Grid.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createMazeMesh } from '/utils/mazes.js'

const grid = new Grid(8, 8)
SideWinder.on(grid)

const [farthest_id] = grid.first_cell.distances.max()
const farthest_cell = grid.cell_by_id(farthest_id)

const [goal_id] = farthest_cell.distances.max()
const goal_cell = grid.cell_by_id(goal_id)

grid.distances = farthest_cell.distances.path_to(goal_cell)
console.log(grid.toString())

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
