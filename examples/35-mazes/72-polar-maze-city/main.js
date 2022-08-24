import { polarMazeCity } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createGround, createHill } from '/utils/ground.js'

const gridSize = 20
const cellSize = 10

scene.add(createHill(gridSize * cellSize * 2))

const sun = createSunLight()
sun.position.set(50, 150, 200)
scene.add(sun)

scene.add(createGround())

camera.position.set(0, 100, 150)
const controls = createOrbitControls()

const grid = new PolarGrid(gridSize)
recursiveBacktracker(grid)

const maze = polarMazeCity(grid)
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
