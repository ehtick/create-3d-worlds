import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { randHeightFromMatrix } from '/utils/mazes.js'
import { aldousBroder } from '/utils/mazes/algorithms/AldousBroder.js'

const matrix = aldousBroder(10)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = randHeightFromMatrix({ matrix, maxSize: 3 })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
