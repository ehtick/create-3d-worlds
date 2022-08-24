import { polarMazeCity } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSunLight, hemLight, ambLight } from '/utils/light.js'
import { createGround, createHill } from '/utils/ground.js'
import Avatar from '/utils/classes/Avatar.js'

const gridSize = 20
const cellSize = 10

const hill = createHill(gridSize * cellSize * 2)
scene.add(hill)

hemLight({ intensity: .5 })
ambLight({ intensity: .5 })
const sun = createSunLight()
sun.position.set(50, 150, 200)
scene.add(sun)

// scene.add(createGround())

// camera.position.set(0, 100, 150)
// const controls = createOrbitControls()

const grid = new PolarGrid(gridSize)
recursiveBacktracker(grid)

const maze = polarMazeCity(grid)
scene.add(maze)

const player = new Avatar({ size: .5, scene, camera, solids: [maze, hill] })
player.position.set(cellSize * .5, 0, -gridSize * cellSize)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
