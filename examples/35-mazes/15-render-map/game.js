import { scene, renderer, camera, hemLight } from '/utils/scene.js'
import { meshFromMatrix, getFieldValue } from '/utils/mazes.js'
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

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  const { x, z } = player.position
  const val = getFieldValue(matrix, x, z, 10)
  console.log(val)
  renderer.render(scene, camera)
}()
