import Grid from '/utils/mazes/Grid.js'
import { huntAndKill } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { hemLight } from '/utils/light.js'

const grid = new Grid(10)
huntAndKill(grid)
const first_cell = grid.cell(0, 0)
grid.distances = first_cell.distances.path_to(grid.last_cell)
const matrix = grid.toMatrix()

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
