import { polarMazePipes } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import Avatar from '/utils/player/Avatar.js'

hemLight({ intensity: .6 })
const sun = createSun()
scene.add(sun)

scene.add(createGround())

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const maze = polarMazePipes({ grid, cellSize: 5 })
scene.add(maze)

const player = new Avatar({ size: .4, camera, solids: maze, jumpStyle: 'FLY_JUMP', maxJumpTime: 30 })
player.cameraControls.distance = 2
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
