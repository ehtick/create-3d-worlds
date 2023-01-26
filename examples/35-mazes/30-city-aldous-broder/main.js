import { scene, renderer, camera } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { meshFromMatrix, putInMaze } from '/utils/mazes.js'
import { aldousBroderMatrix } from '/utils/mazes/algorithms.js'
import Avatar from '/utils/fsm/Avatar.js'
import { material } from '/utils/shaders/windows.js'
import { hemLight } from '/utils/light.js'

const size = 3

hemLight()
scene.add(createFloor())

const matrix = aldousBroderMatrix(10)
const maze = meshFromMatrix({ matrix, size, maxHeight: size * 3, material })
scene.add(maze)

const player = new Avatar({ size: .5, camera })
scene.add(player.mesh)
player.addSolids(maze)
putInMaze(player.mesh, matrix, size)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
