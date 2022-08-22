import { scene, renderer, camera } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { meshFromMatrix, putInMaze } from '/utils/mazes.js'
import { aldousBroder } from '/utils/mazes/algorithms/AldousBroder.js'
import Avatar from '/utils/classes/Avatar.js'
import { material } from '/utils/shaders/windows.js'
import { hemLight } from '/utils/light.js'

hemLight()

const size = 3
camera.position.set(0, 1, 1.5)

scene.add(createFloor())

const matrix = aldousBroder(10)
const maze = meshFromMatrix({ matrix, size, maxSize: size * 3, material })
scene.add(maze)

const player = new Avatar({ size: .5 })
player.add(camera)
player.addSolids(maze)
scene.add(player.mesh)

putInMaze(player.mesh, matrix, size)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
