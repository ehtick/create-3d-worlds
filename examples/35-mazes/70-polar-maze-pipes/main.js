import { meshFromPolarGrid } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'

const sun = createSunLight()
scene.add(sun)

camera.position.set(0, 25, 50)
const controls = createOrbitControls()

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const mesh = meshFromPolarGrid(grid)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
