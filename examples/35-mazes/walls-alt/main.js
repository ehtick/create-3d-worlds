import Grid from '/utils/mazes/Grid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { SorceressPlayer } from '/utils/actors/fantasy/Sorceress.js'

createOrbitControls()

scene.add(createSun())
scene.add(createGround())

const grid = new Grid(5, 10)
recursiveBacktracker(grid)
const maze = grid.toMesh({ texture: 'walls/stonetiles.jpg' })
scene.add(maze)

const pos = grid.cellToPosition([0, 9])

const player = new SorceressPlayer({ solids: maze })
player.position.copy(pos)
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
