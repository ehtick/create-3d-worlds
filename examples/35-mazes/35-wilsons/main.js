import { scene, renderer, camera } from '/utils/scene.js'
import { pyramidFromMatrix, putInMaze } from '/utils/mazes.js'
import { wilsons } from '/utils/mazes/algorithms/Wilsons.js'
import Avatar from '/utils/classes/Avatar.js'
import { hemLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'

const matrix = wilsons(12)
const size = 3

hemLight()

camera.position.set(0, 1, 1.5)

const maze = pyramidFromMatrix({ matrix, size, texture: 'mayan.jpg' })
scene.add(maze)
scene.add(createGround())

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
