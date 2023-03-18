import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { pyramidFromMatrix, putInMaze } from '/utils/mazes.js'
import { huntAndKillMatrix } from '/utils/mazes/algorithms.js'
import Avatar from '/utils/player/Avatar.js'
import { hemLight } from '/utils/light.js'
import { createMarble } from '/utils/ground.js'

scene.add(createMarble())

const size = 3

createOrbitControls()
hemLight()

const matrix = huntAndKillMatrix(12)
const maze = pyramidFromMatrix({ matrix, size, texture: 'walls/mayan.jpg' })
scene.add(maze)

const player = new Avatar({ size: .5, camera, solids: maze })
putInMaze(player.mesh, matrix, size)
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
