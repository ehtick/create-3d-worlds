import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { pyramidFromMatrix } from '/utils/mazes.js'
import { wilsons } from '/utils/mazes/algorithms/Wilsons.js'

const matrix = wilsons(12)

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = pyramidFromMatrix({ matrix, maxSize: 8 })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
