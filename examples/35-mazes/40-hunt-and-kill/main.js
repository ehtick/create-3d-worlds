import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { pyramidFromMatrix } from '/utils/mazes.js'
import { huntAndKill } from '/utils/mazes/algorithms/HuntAndKill.js'
import { hemLight } from '/utils/light.js'

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
