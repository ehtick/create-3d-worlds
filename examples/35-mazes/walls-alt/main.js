import Grid from '/utils/mazes/Grid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromGrid } from '/utils/mazes.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { SorceressPlayer } from '/utils/actors/fantasy/Sorceress.js'

// createOrbitControls()

scene.add(createSun())
scene.add(createGround())

const grid = new Grid(10)
recursiveBacktracker(grid)

// const maze = meshFromMatrix({ matrix, texture: 'walls/stonetiles.jpg', size: 3, maxHeight: 6 })
const maze = meshFromGrid({ grid, texture: 'walls/stonetiles.jpg', cellSize: 10, maxHeight: 6 })
scene.add(maze)

const player = new SorceressPlayer({ camera, solids: maze })
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
