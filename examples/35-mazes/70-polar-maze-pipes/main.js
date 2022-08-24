import { meshFromPolarGrid } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSunLight, hemLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import Avatar from '/utils/classes/Avatar.js'

hemLight({ intensity: .6 })
const sun = createSunLight()
scene.add(sun)

scene.add(createGround())

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const maze = meshFromPolarGrid({ grid, cellSize: 5 })
scene.add(maze)

const player = new Avatar({ size: .5, scene, camera, solids: maze })

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
