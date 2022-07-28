import { renderMaze, renderPath } from './utils.js'

const mazeContainer = document.querySelector('.maze')
const canvas = document.querySelector('canvas')

const pixelRatio = window.devicePixelRatio || 1

const lineWidth = 4
const size = 10
let width = Math.min(mazeContainer.clientWidth, mazeContainer.clientHeight)
const rows = Math.floor(width / 2 / size)
width = 2 * rows * size

canvas.width = width * pixelRatio + lineWidth
canvas.height = width * pixelRatio + lineWidth
canvas.style.width = `${width + lineWidth}px`
canvas.style.height = `${width + lineWidth}px`

let grid = []
let maxDistance = 0

const getNeighbors = cell => {
  const list = []
  if (cell.cw) list.push(grid[cell.cw.row][cell.cw.col])
  if (cell.ccw) list.push(grid[cell.ccw.row][cell.ccw.col])
  if (cell.inward) list.push(grid[cell.inward.row][cell.inward.col])

  cell.outward.forEach(out => {
    list.push(grid[out.row][out.col])
  })
  return list
}

const huntAndKill = () => {
  const randomRow = Math.floor(Math.random() * rows)
  const randomCol = Math.floor(Math.random() * grid[randomRow].length)
  let current = grid[randomRow][randomCol]

  while (current) {
    const unvisitedNeighbors = getNeighbors(current).filter(n => n.links.length === 0)
    const { length } = unvisitedNeighbors

    if (length) {
      const rand = Math.floor(Math.random() * length)
      const { row, col } = unvisitedNeighbors[rand]

      current.links.push({ row, col })
      grid[row][col].links.push({ row: current.row, col: current.col })

      current = unvisitedNeighbors[rand]
    } else {
      current = null

      loop:
      for (const row of grid)
        for (const cell of row) {
          const visitedNeighbors = getNeighbors(cell).filter(n => n.links.length !== 0)

          if (cell.links.length === 0 && visitedNeighbors.length !== 0) {
            current = cell

            const rand = Math.floor(Math.random() * visitedNeighbors.length)
            const { row, col } = visitedNeighbors[rand]

            current.links.push({ row, col })
            grid[row][col].links.push({ row: current.row, col: current.col })

            break loop
          }
        }

    }
  }
  renderMaze(grid)
}

const calculateDistance = (row = 0, col = 0, value = 0) => {
  maxDistance = Math.max(maxDistance, value)
  grid[row][col].distance = value
  grid[row][col].links.forEach(l => {
    const { distance } = grid[l.row][l.col]
    if (!distance && distance !== 0)
      calculateDistance(l.row, l.col, value + 1)
  })
}

const solveMaze = () => {
  calculateDistance()
  renderPath(grid)
}

const positionCells = () => {
  const center = width / 2

  grid.forEach(row => {
    row.forEach(cell => {
      const angle = 2 * Math.PI / row.length
      const innerRadius = cell.row * size
      const outerRadius = (cell.row + 1) * size
      const angleCcw = cell.col * angle
      const angleCw = (cell.col + 1) * angle

      cell.innerCcwX = Math.round(center + (innerRadius * Math.cos(angleCcw))) * pixelRatio + lineWidth / 2
      cell.innerCcwY = Math.round(center + (innerRadius * Math.sin(angleCcw))) * pixelRatio + lineWidth / 2
      cell.outerCcwX = Math.round(center + (outerRadius * Math.cos(angleCcw))) * pixelRatio + lineWidth / 2
      cell.outerCcwY = Math.round(center + (outerRadius * Math.sin(angleCcw))) * pixelRatio + lineWidth / 2
      cell.innerCwX = Math.round(center + (innerRadius * Math.cos(angleCw))) * pixelRatio + lineWidth / 2
      cell.innerCwY = Math.round(center + (innerRadius * Math.sin(angleCw))) * pixelRatio + lineWidth / 2
      cell.outerCwX = Math.round(center + (outerRadius * Math.cos(angleCw))) * pixelRatio + lineWidth / 2
      cell.outerCwY = Math.round(center + (outerRadius * Math.sin(angleCw))) * pixelRatio + lineWidth / 2

      const centerAngle = (angleCcw + angleCw) / 2

      cell.centerX = (Math.round(center + (innerRadius * Math.cos(centerAngle))) * pixelRatio + lineWidth / 2 +
        Math.round(center + (outerRadius * Math.cos(centerAngle))) * pixelRatio + lineWidth / 2) / 2
      cell.centerY = (Math.round(center + (innerRadius * Math.sin(centerAngle))) * pixelRatio + lineWidth / 2 +
        Math.round(center + (outerRadius * Math.sin(centerAngle))) * pixelRatio + lineWidth / 2) / 2
    })
  })
}

const createGrid = () => {
  const rowHeight = 1 / rows

  grid = []
  grid.push([{ row: 0, col: 0, links: [], outward: [] }])

  for (let i = 1; i < rows; i++) {
    const radius = i / rows
    const circumference = 2 * Math.PI * radius
    const prevCount = grid[i - 1].length
    const cellWidth = circumference / prevCount
    const ratio = Math.round(cellWidth / rowHeight)
    const count = prevCount * ratio

    const row = []

    for (let j = 0; j < count; j++)
      row.push({
        row: i,
        col: j,
        links: [],
        outward: [],
      })

    grid.push(row)
  }

  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.row > 0) {
        cell.cw = { row: i, col: (j === row.length - 1 ? 0 : j + 1) }
        cell.ccw = { row: i, col: (j === 0 ? row.length - 1 : j - 1) }

        const ratio = grid[i].length / grid[i - 1].length
        const parent = grid[i - 1][Math.floor(j / ratio)]

        cell.inward = { row: parent.row, col: parent.col }
        parent.outward.push({ row: cell.row, col: cell.col })
      }
    })
  })

  positionCells()
}

const createMaze = () => {
  createGrid()
  huntAndKill()
}

createMaze()

document.querySelector('button.create').addEventListener('click', createMaze)
document.querySelector('button.solve').addEventListener('click', solveMaze)
