import Grid from '/utils/mazes/Grid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { SorceressPlayer } from '/utils/actors/fantasy/Sorceress.js'

scene.add(createSun())
scene.add(createGround())

const grid = new Grid(10)
recursiveBacktracker(grid)
const maze = grid.toMesh({ texture: 'walls/stonetiles.jpg' })
scene.add(maze)

const player = new SorceressPlayer({ camera, solids: maze })
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
