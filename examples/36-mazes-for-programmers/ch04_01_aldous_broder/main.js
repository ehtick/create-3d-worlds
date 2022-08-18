import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createMazeMesh } from '/utils/mazes.js'

import AldousBroder from '../mazes/algorithms/AldousBroder.js'
import Grid from '../mazes/Grid.js'

const grid = new Grid(20)
AldousBroder.on(grid)

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
