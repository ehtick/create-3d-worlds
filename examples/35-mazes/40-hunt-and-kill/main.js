import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { pyramidFromMatrix } from '/utils/mazes.js'
import { huntAndKill } from '/utils/mazes/algorithms/HuntAndKill.js'

const matrix = huntAndKill(20)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = pyramidFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
