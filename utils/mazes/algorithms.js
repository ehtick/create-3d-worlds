import Grid from './Grid.js'
import { sample } from './utils.js'

/* BINARY TREE */

export function binaryTree(grid) {
  for (const cell of grid.each_cell()) {
    const neighbors = []
    if (cell.north) neighbors.push(cell.north)
    if (cell.east) neighbors.push(cell.east)
    const neighbor = sample(neighbors)
    if (neighbor) cell.link(neighbor)
  }
}

export function binaryTreeMatrix(rows, columns) {
  const grid = new Grid(rows, columns)
  binaryTree(grid)
  return grid.toMatrix()
}

/* SIDEWINDER */

export function sideWinder(grid) {
  for (const row of grid.each_row()) {
    let run = []
    for (const cell of row) {
      run.push(cell)
      const should_close_out = !cell.east || (cell.north && Math.random() < 0.5)
      if (should_close_out) {
        const member = sample(run)
        if (member.north) member.link(member.north)
        run = []
      } else
        cell.link(cell.east)
    }
  }
}

export function sideWinderMatrix(rows, columns) {
  const grid = new Grid(rows, columns)
  sideWinder(grid)
  return grid.toMatrix()
}

/* RECURSIVE BACKTRACKER (depth-first search) */

export function recursiveBacktracker(grid, start_at = grid.random_cell) {
  const stack = [start_at]

  while (stack.length) {
    const current = stack[stack.length - 1]
    const neighbors = current.neighbors.filter(cell => cell.unvisited)
    if (!neighbors.length)
      stack.pop()
    else {
      const neighbor = sample(neighbors)
      current.link(neighbor)
      stack.push(neighbor)
    }
  }
}

export function recursiveBacktrackerMatrix(rows, columns) {
  const grid = new Grid(rows, columns)
  recursiveBacktracker(grid)
  return grid.toMatrix()
}