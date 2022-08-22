import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { aldousBroder } from '/utils/mazes/algorithms/AldousBroder.js'
import Avatar from '/utils/classes/Avatar.js'

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

scene.add(createGround())

const matrix = aldousBroder(10)
const maze = meshFromMatrix({ matrix, size: 2, maxSize: 5 })
scene.add(maze)

const player = new Avatar()
scene.add(player.mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  player.update()
  renderer.render(scene, camera)
}()
