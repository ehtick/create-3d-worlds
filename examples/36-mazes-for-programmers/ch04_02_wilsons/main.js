import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createMazeMesh } from '/utils/mazes.js'

import Grid from '../mazes/Grid.js'
import Wilsons from '../mazes/algorithms/Wilsons.js'

const grid = new Grid(20)
Wilsons.on(grid)

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
