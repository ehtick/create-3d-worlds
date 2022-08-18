import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createMaze } from '/utils/circular-maze.js'
import { createCircularCity } from '/utils/mazes.js'
import { OutlineEffect } from '/node_modules/three/examples/jsm/effects/OutlineEffect.js'

const sun = createSunLight()
sun.position.set(50, 150, 200)
scene.add(sun)

createOrbitControls()
camera.position.set(0, 100, 150)

const size = 400
const cellSize = 10

const grid = createMaze({ size, cellSize })

const mesh = createCircularCity(grid)
scene.add(mesh)

/* LOOP */

const effect = new OutlineEffect(renderer, { defaultThickness: 0.003 })

void function render() {
  requestAnimationFrame(render)
  effect.render(scene, camera)
}()