import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createMaze } from '/utils/circular-maze.js'
import { renderCircularMaze } from './render-utils.js'

initLights()
createOrbitControls()

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