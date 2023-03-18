import { polarMazeCity } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, createToonRenderer, camera } from '/utils/scene.js'
import { createSun, hemLight, ambLight } from '/utils/light.js'
import { createHill } from '/utils/ground.js'
import Avatar from '/utils/player/Avatar.js'

const gridSize = 20
const cellSize = 10
const groundSize = gridSize * cellSize

const hill = createHill(groundSize * 2.05)
scene.add(hill)

hemLight({ intensity: .5 })
ambLight({ intensity: .5 })
const sun = createSun()
sun.position.set(50, 150, 200)
scene.add(sun)

const grid = new PolarGrid(gridSize)
recursiveBacktracker(grid)

const maze = polarMazeCity({ grid })
scene.add(maze)

const player = new Avatar({ size: .5, camera, solids: [maze, hill] })
scene.add(player.mesh)
const x = cellSize * .5
const z = -groundSize - cellSize
player.position.set(x, 0, z)
player.mesh.lookAt(0, 0, -groundSize * 2)

const renderer = createToonRenderer()

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
