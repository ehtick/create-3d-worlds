import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { generateMaze, createMazeMesh } from '/utils/mazes.js'

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const matrix = generateMaze(20, 20)
console.log(matrix)
const maze = createMazeMesh({ matrix })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
