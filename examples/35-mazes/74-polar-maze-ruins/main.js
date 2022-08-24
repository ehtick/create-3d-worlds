import { OutlineEffect } from '/node_modules/three/examples/jsm/effects/OutlineEffect.js'
import { polarMazeRuins } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createCamoGround } from '/utils/ground.js'

const sun = createSunLight()
scene.add(sun)

const ground = createCamoGround()
scene.add(ground)
camera.position.set(0, 25, 50)
const controls = createOrbitControls()

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const mesh = polarMazeRuins({ grid })
scene.add(mesh)
const effect = new OutlineEffect(renderer, { defaultThickness: 0.003 })

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  effect.render(scene, camera)
  // renderer.render(scene, camera)
}()
