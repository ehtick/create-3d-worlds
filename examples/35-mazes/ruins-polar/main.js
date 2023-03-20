import { polarMazeRuins } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, camera, createOrbitControls, createToonRenderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createDunes } from '/utils/ground.js'
import { ResistanceFighterPlayer } from '/utils/actors/ww2/ResistanceFighter.js'

const sun = createSun()
scene.add(sun)

const ground = createDunes({ size: 1000 })
scene.add(ground)
// camera.position.set(0, 25, 50)
// const controls = createOrbitControls()

const grid = new PolarGrid(10)
recursiveBacktracker(grid)

const maze = polarMazeRuins({ grid })
scene.add(maze)

const player = new ResistanceFighterPlayer({ camera, solids: [maze, ground] })
scene.add(player.mesh)

/* LOOP */

const renderer = createToonRenderer()

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
