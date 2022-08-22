import { scene, renderer, camera, hemLight } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { meshFromMatrix, firstCellPos } from '/utils/mazes.js'
import { aldousBroder } from '/utils/mazes/algorithms/AldousBroder.js'
import Avatar from '/utils/classes/Avatar.js'

hemLight()

const size = 3
camera.position.set(0, 2, 3)

scene.add(createGround())

const matrix = aldousBroder(10)
const maze = meshFromMatrix({ matrix, size, maxSize: size * 3 })
scene.add(maze)

const player = new Avatar()
player.add(camera)
player.addSolids(maze)
scene.add(player.mesh)

const { x, z } = firstCellPos(matrix, size)
player.mesh.position.set(x, 0, z)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
