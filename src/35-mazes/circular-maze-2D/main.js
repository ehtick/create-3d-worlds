import { createMaze } from './circular-maze.js'
import { calculateDistance, renderMaze, renderPath } from './render-utils.js'

const canvas = document.querySelector('canvas')

const width = 400
const cellSize = 10
const rows = Math.floor(width / 2 / cellSize)

canvas.width = width
canvas.height = width

let grid

const newMaze = () => {
  grid = createMaze({ width, rows, cellSize })
  renderMaze(grid)
}

const solveMaze = () => {
  calculateDistance(grid)
  renderPath(grid)
}

newMaze()

document.querySelector('button.create').addEventListener('click', newMaze)
document.querySelector('button.solve').addEventListener('click', solveMaze)
