import { scene, renderer, camera } from '/utils/scene.js'
import { pyramidFromMatrix, putInMaze } from '/utils/mazes.js'
import { wilsonsMatrix } from '/utils/mazes/algorithms.js'
import Avatar from '/utils/classes/Avatar.js'
import { hemLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'

const size = 3

hemLight()
scene.add(createGround())

const matrix = wilsonsMatrix(12)
const maze = pyramidFromMatrix({ matrix, size, texture: 'walls/mayan.jpg' })
scene.add(maze)

const player = new Avatar({ size: .5, camera, scene })
player.addSolids(maze)
putInMaze(player.mesh, matrix, size)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
