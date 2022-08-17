import { createMaze } from '/utils/circular-maze.js'
import { calculateDistance, renderMaze, renderPath } from './render-utils.js'

const canvas = document.querySelector('canvas')

const size = 400
const cellSize = 10

canvas.width = size
canvas.height = size

let grid

const newMaze = () => {
  grid = createMaze({ size, cellSize, center: size / 2 })
  console.log(grid)
  renderMaze(grid)
}

const solveMaze = () => {
  calculateDistance(grid)
  renderPath(grid)
}

newMaze()

document.querySelector('button.create').addEventListener('click', newMaze)
document.querySelector('button.solve').addEventListener('click', solveMaze)
