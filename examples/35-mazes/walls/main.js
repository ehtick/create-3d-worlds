import { recursiveBacktrackerMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { meshFromMatrix, fieldToPosition } from '/utils/mazes.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { SorceressPlayer } from '/utils/actors/fantasy/Sorceress.js'

scene.add(createSun())
scene.add(createGround())

const matrix = recursiveBacktrackerMatrix(5, 10)
const maze = meshFromMatrix({ matrix, texture: 'walls/stonetiles.jpg', size: 3, maxHeight: 6 })
scene.add(maze)

const pos = fieldToPosition(matrix, [1, 19], 3)
const player = new SorceressPlayer({ camera, solids: maze })
// player.cameraControls.offset = [0, 20, 0]
player.position.copy(pos)
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
