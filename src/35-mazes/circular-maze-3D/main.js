import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createMaze } from '/utils/circular-maze.js'
import { renderCircularMaze } from './render-utils.js'

scene.add(createSunLight())
createOrbitControls()

camera.position.set(0, 100, 150)

const size = 400
const cellSize = 10

const grid = createMaze({ size, cellSize })

const mesh = renderCircularMaze(grid)
scene.add(mesh)

/* LOOP */

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()