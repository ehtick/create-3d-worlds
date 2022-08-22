import { scene, renderer, camera } from '/utils/scene.js'
import { pyramidFromMatrix, firstCellPos } from '/utils/mazes.js'
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

const { x, z } = firstCellPos(matrix, size)
player.mesh.position.set(x, 0, z)
player.mesh.lookAt(x, 0, z - 1)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  renderer.render(scene, camera)
}()
