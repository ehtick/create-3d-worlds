import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import Grid from '/utils/mazes/Grid.js'
import { truePrims } from '/utils/mazes/algorithms.js'
import { meshFromMatrix } from '/utils/mazes.js'
import Player from '/utils/player/Player.js'
import { createGround } from '/utils/ground.js'
import Tilemap from '/utils/classes/Tilemap.js'

const grid = new Grid(4)
truePrims(grid)
grid.distances = grid.cell(0, 0).distances.path_to(grid.last_cell)
const matrix = grid.toMatrix()

hemLight()
scene.add(createGround())

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const tilemap = new Tilemap(matrix, 1)
const maze = tilemap.meshFromMatrix({ matrix })
scene.add(maze)

const player = new Player({ solids: maze })
player.mesh.visible = true

// TODO: tilemap.gridToPos()
const cell = tilemap.fromGridCell(0, 0)
const pos = tilemap.fieldToPosition(cell)
player.position.copy(pos)

scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  player.update()
  renderer.render(scene, camera)
}()
