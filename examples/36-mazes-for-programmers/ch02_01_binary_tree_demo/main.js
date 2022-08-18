import Grid from '../mazes/Grid.js'
import BinaryTree from '../mazes/algorithms/BinaryTree.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import { primsAlgorithm, createMazeMesh } from '/utils/mazes.js'

const h = 8
const w = 8
const grid = new Grid(h, w)
BinaryTree.on(grid)

console.log(grid.toMatrix())

const cellSize = 20

grid.draw(cellSize)

/* 3D */

hemLight()

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = createMazeMesh({ matrix: grid.toMatrix() })
scene.add(maze)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
