import { recursiveBacktrackerMatrix } from '/utils/mazes/algorithms.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { meshFromMatrix, fieldToPosition } from '/utils/mazes.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { SorceressPlayer } from '/utils/actors/fantasy/Sorceress.js'

const matrix = recursiveBacktrackerMatrix(20)

scene.add(createSun())
scene.add(createGround())

const maze = meshFromMatrix({ matrix, texture: 'walls/stonetiles.jpg', size: 3, maxHeight: 6 })
scene.add(maze)

const pos = fieldToPosition(matrix, [1, 1], 3)
const player = new SorceressPlayer({ camera, solids: maze })
player.position.copy(pos)
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
