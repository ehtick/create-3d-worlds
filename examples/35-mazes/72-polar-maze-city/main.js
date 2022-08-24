import { OutlineEffect } from '/node_modules/three/examples/jsm/effects/OutlineEffect.js'
import { polarMazeCity } from '/utils/mazes.js'
import PolarGrid from '/utils/mazes/PolarGrid.js'
import { recursiveBacktracker } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { createSunLight, hemLight, ambLight } from '/utils/light.js'
import { createHill } from '/utils/ground.js'
import Avatar from '/utils/classes/Avatar.js'

const gridSize = 20
const cellSize = 10
const groundSize = gridSize * cellSize

const hill = createHill(groundSize * 2.05)
scene.add(hill)

hemLight({ intensity: .5 })
ambLight({ intensity: .5 })
const sun = createSunLight()
sun.position.set(50, 150, 200)
scene.add(sun)

// camera.position.set(0, 100, 150)

const grid = new PolarGrid(gridSize)
recursiveBacktracker(grid)

const maze = polarMazeCity(grid)
scene.add(maze)

const player = new Avatar({ size: .5, scene, camera, solids: [maze, hill] })
player.position.set(cellSize * .5, 0, -groundSize - cellSize)
player.mesh.lookAt(0, 0, -groundSize * 2)

const effect = new OutlineEffect(renderer, { defaultThickness: 0.003 })

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  effect.render(scene, camera)
}()
