import { polarMazeRuins } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, camera, createOrbitControls, createToonRenderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createDunes } from '/utils/ground.js'

const sun = createSun()
scene.add(sun)

const ground = createDunes({ size: 1000 })
scene.add(ground)
camera.position.set(0, 25, 50)
const controls = createOrbitControls()

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const mesh = polarMazeRuins({ grid })
scene.add(mesh)
const renderer = createToonRenderer()

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
