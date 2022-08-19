import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { huntAndKill } from '../mazes/algorithms/HuntAndKill.js'

const matrix = huntAndKill(20)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
