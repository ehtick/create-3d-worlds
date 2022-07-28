import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createLine, renderCircularMaze } from './render-utils.js'
import { createMaze } from './circular-maze.js'
import { centerObject } from '/utils/helpers.js'

initLights()
createOrbitControls()
scene.add(new THREE.AxesHelper(50))

const point1 = new THREE.Vector3(2, 0, 0)
const point2 = new THREE.Vector3(0, 0, 6)

// const line = createLine(point1, point2)
// scene.add(line)

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