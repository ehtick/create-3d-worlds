import { scene, renderer, camera, hemLight } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { createGround } from '/utils/ground.js'
import matrix from '/data/small-map.js'
import Avatar from '/utils/classes/Avatar.js'

hemLight()

camera.position.set(0, 7, 10)

scene.add(createGround({ file: 'ground.jpg', size: 100 }))

const map = meshFromMatrix({ matrix, size: 10 })
scene.add(map)

const player = new Avatar()
player.add(camera)
scene.add(player.mesh)

/* FUNCTIONS */

function getFieldValue(matrix, size, playerX, playerZ) {
  const x = Math.floor(playerX / size + matrix.length / 2)
  const y = Math.floor(playerZ / size + matrix.length / 2)
  if (x < 0 || x >= matrix[0].length || y < 0 || y >= matrix.length)
    return -1
  return matrix[y][x]
}

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  const { x, z } = player.position
  const val = getFieldValue(matrix, 10, x, z)
  console.log(val)
  renderer.render(scene, camera)
}()
