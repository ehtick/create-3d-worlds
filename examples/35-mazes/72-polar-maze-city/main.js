import { polarMazeCity } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'

const sun = createSunLight()
sun.position.set(50, 150, 200)
scene.add(sun)

camera.position.set(0, 100, 150)
const controls = createOrbitControls()

const grid = new PolarGrid(20)
recursiveBacktracker(grid)

const mesh = polarMazeCity(grid)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
