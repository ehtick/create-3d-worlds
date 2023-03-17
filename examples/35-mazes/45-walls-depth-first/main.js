import { recursiveBacktrackerMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { hemLight, createSun } from '/utils/light.js'

const matrix = recursiveBacktrackerMatrix(20)

hemLight()
scene.add(createSun())

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix, texture: 'walls/stonetiles.jpg', normalFile: 'stonetiles_n.jpg' })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
