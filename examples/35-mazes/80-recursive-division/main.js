import Grid from '/utils/mazes/Grid.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { recursiveDivision } from '/utils/mazes/algorithms.js'
import { meshFromGrid } from '/utils/mazes.js'
import { hemLight } from '/utils/light.js'
import { createCamoGround } from '/utils/ground.js'

hemLight()
camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const grid = new Grid(10)
recursiveDivision(grid)

const mesh = meshFromGrid({ grid })
scene.add(mesh)

scene.add(createCamoGround())

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
