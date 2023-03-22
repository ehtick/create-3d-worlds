import Grid from '/utils/mazes/Grid.js'
import { scene, createToonRenderer, camera } from '/utils/scene.js'
import { recursiveDivision } from '/utils/mazes/algorithms.js'
import { meshFromGrid } from '/utils/mazes.js'
import { hemLight } from '/utils/light.js'
import { createDunes } from '/utils/ground.js'
import { WitchPlayer } from '/utils/actors/fantasy/Witch.js'

hemLight()

const grid = new Grid(15)
recursiveDivision(grid)
const maze = meshFromGrid({ grid })
scene.add(maze)

const dunes = createDunes()
scene.add(dunes)

const renderer = createToonRenderer()

const player = new WitchPlayer({ camera, solids: [dunes, maze] })
player.cameraControls.offset = [0, 12, 0]

scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
