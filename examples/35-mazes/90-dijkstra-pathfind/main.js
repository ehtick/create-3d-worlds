import Grid from '/utils/mazes/Grid.js'
import HuntAndKill from '/utils/mazes/algorithms/HuntAndKill.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { hemLight } from '/utils/light.js'

const grid = new Grid(10)
HuntAndKill.on(grid)
const first_cell = grid.cell(0, 0)
grid.distances = first_cell.distances.path_to(grid.last_cell)
const matrix = grid.toMatrix()

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
