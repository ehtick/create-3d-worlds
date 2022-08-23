import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import Grid from '/utils/mazes/Grid.js'
import RecursiveBacktracker from '/utils/mazes/algorithms/RecursiveBacktracker.js'
import { hemLight } from '/utils/light.js'

const grid = new Grid(20)
RecursiveBacktracker.on(grid)
grid.braid(0.5) // remove deadends
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
