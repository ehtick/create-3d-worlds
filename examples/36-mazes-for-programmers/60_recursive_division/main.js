import Grid from '../mazes/Grid.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import RecursiveDivision from '../mazes/algorithms/RecursiveDivision.js'
import { meshFromGrid } from '/utils/mazes.js'

hemLight()
camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const grid = new Grid(10)
RecursiveDivision.on(grid)

const mesh = meshFromGrid(grid)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
