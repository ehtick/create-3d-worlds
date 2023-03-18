import { recursiveBacktrackerMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'

const matrix = recursiveBacktrackerMatrix(20)

scene.add(createSun())
scene.add(createGround())

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = meshFromMatrix({ matrix, texture: 'walls/stonetiles.jpg', maxHeight: 2 })
scene.add(maze)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
