
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createMaze } from './circular-maze.js'
import { renderCircularMaze } from './render-utils.js'
import { centerObject } from '/utils/helpers.js'

initLights()
createOrbitControls()

const width = 400
const cellSize = 10
const lineWidth = 4
const rows = Math.floor(width / 2 / cellSize)

const grid = createMaze({ width, rows, cellSize, lineWidth })

const mesh = renderCircularMaze(grid)
centerObject(mesh)
scene.add(mesh)

/* LOOP */

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()