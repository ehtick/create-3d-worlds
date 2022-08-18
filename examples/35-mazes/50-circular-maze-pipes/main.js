import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createMaze } from '/utils/circular-maze.js'
import { createCircularPipes } from '/utils/mazes.js'

const sun = createSunLight()
scene.add(sun)

createOrbitControls()
camera.position.set(0, 25, 50)

const size = 250
const cellSize = 10

const grid = createMaze({ size, cellSize })
console.log(grid)

const mesh = createCircularPipes(grid)
scene.add(mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}()