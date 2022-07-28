import { createMaze } from './circular-maze.js'
import { renderMaze, renderPath } from './utils.js'

const canvas = document.querySelector('canvas')

const width = 400
const cellSize = 10
const lineWidth = 4
const rows = Math.floor(width / 2 / cellSize)

canvas.width = width + lineWidth
canvas.height = width + lineWidth
canvas.style.width = `${width + lineWidth}px`
canvas.style.height = `${width + lineWidth}px`

let grid

const calculateDistance = (row = 0, col = 0, value = 0) => {
  grid[row][col].distance = value
  grid[row][col].links.forEach(l => {
    const { distance } = grid[l.row][l.col]
    if (!distance && distance !== 0)
      calculateDistance(l.row, l.col, value + 1)
  })
}

const newMaze = () => {
  grid = createMaze({ width, rows, cellSize, lineWidth })
  renderMaze(grid)
}

const solveMaze = () => {
  calculateDistance()
  renderPath(grid)
}

newMaze()

document.querySelector('button.create').addEventListener('click', newMaze)
document.querySelector('button.solve').addEventListener('click', solveMaze)
