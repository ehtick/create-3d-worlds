import { createMaze } from './circular-maze.js'
import { calculateDistance, renderMaze, renderPath } from './render-utils.js'

const canvas = document.querySelector('canvas')

const width = 400
const cellSize = 10
const lineWidth = 4
const rows = Math.floor(width / 2 / cellSize)

canvas.width = width + lineWidth
canvas.height = width + lineWidth
canvas.style.width = `${canvas.width}px`
canvas.style.height = `${canvas.width}px`

let grid

const newMaze = () => {
  grid = createMaze({ width, rows, cellSize, lineWidth })
  renderMaze(grid)
}

const solveMaze = () => {
  calculateDistance(grid)
  renderPath(grid)
}

newMaze()

document.querySelector('button.create').addEventListener('click', newMaze)
document.querySelector('button.solve').addEventListener('click', solveMaze)
