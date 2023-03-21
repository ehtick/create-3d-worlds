import { shuffle } from '/utils/helpers.js'
import Cell from './Cell.js'

export default class Grid {
  constructor(rows = 20, columns = rows) {
    this.rows = rows
    this.columns = columns
    this.prepare_grid()
    this.configure_cells()
  }

  prepare_grid() {
    this.grid = new Array(this.rows)
    for (let i = 0; i < this.rows; i += 1) {
      this.grid[i] = new Array(this.columns)
      for (let j = 0; j < this.columns; j += 1)
        this.grid[i][j] = new Cell(i, j)
    }
  }

  configure_cells() {
    for (const cell of this.each_cell()) {
      const { row, column: col } = cell
      if (row > 0) cell.north = this.cell(row - 1, col)
      if (row < this.rows - 1) cell.south = this.cell(row + 1, col)
      if (col > 0) cell.west = this.cell(row, col - 1)
      if (col < this.columns - 1) cell.east = this.cell(row, col + 1)
    }
  }

  cell(row, column) {
    if (row < 0 || row > this.rows - 1) return null
    if (column < 0 || column > this.grid[row].length - 1) return null
    return this.grid[row][column]
  }

  cell_by_id(id) {
    const [row, col] = id.split('#').map(Number)
    return this.cell(row, col)
  }

  * each_row() {
    for (const row of this.grid)
      if (row) yield row
  }

  * each_cell() {
    for (const row of this.grid)
      for (const cell of row)
        if (cell) yield cell
  }

  get size() {
    return this.rows * this.columns
  }

  set distances(distances = this.middle_cell.distances) {
    this._distances = distances
    const [_, maximum] = distances.max()
    this.maximum = maximum
  }

  get distances() {
    return this._distances
  }

  get first_cell() {
    return this.cell(0, 0)
  }

  get middle_cell() {
    return this.cell(Math.floor(this.rows / 2), Math.floor(this.columns / 2))
  }

  get last_cell() {
    return this.cell(this.rows - 1, this.columns - 1)
  }

  get random_cell() {
    const row = Math.floor(Math.random() * this.rows)
    const column = Math.floor(Math.random() * this.grid[row].length)
    return this.cell(row, column)
  }

  get deadends() {
    const list = []
    for (const cell of this.each_cell())
      if (cell.links_length == 1)
        list.push(cell)
    return list
  }

  // remove deadends
  braid(percent = 0.5) {
    const { deadends } = this
    shuffle(deadends)
    deadends.forEach(cell => {
      if (cell.links_length != 1 || Math.random() > percent)
        return

      const neighbors = cell.neighbors.filter(c => !c.linked(cell))
      let best = neighbors.filter(c => c.links_length == 1)
      if (best.length == 0) best = neighbors

      const neighbor = best[Math.floor(Math.random() * best.length)]
      cell.link(neighbor)
    })
  }

  contents_of(cell) {
    const distance = this.distances?.get(cell)
    if (distance >= 0)
      return distance.toString(36) // base-36 int, because we’re limited to one character
    return ' '
  }

  toString() {
    let output = ''
    output += '+' + '---+'.repeat(this.columns) + '\n'
    for (const row of this.grid) {
      let top = '|'
      let bottom = '+'
      for (const cell of row) {
        if (!cell) continue
        const body = ` ${this.contents_of(cell)} `
        const east_boundary = cell.linked(cell.east) ? ' ' : '|'
        top += body + east_boundary
        const south_boundary = cell.linked(cell.south) ? '   ' : '---'
        const corner = '+'
        bottom += south_boundary + corner
      }
      output += top + '\n' + bottom + '\n'
    }
    return output
  }

  toMatrix() {
    const matrix = [[...Array(this.columns * 2 + 1).keys()].map(() => 1)] // build first row
    for (const row of this.grid) {
      const top = [1]
      const bottom = [1]
      for (const cell of row) {
        if (!cell) continue
        const val = -this.distances?.get(cell)
        const east_boundary = cell.linked(cell.east) ? 0 : 1
        top.push(val, east_boundary)
        const south_boundary = cell.linked(cell.south) ? 0 : 1
        const corner = 1
        bottom.push(south_boundary, corner)
      }
      matrix.push(top)
      matrix.push(bottom)
    }
    // matrix[0][1] = 0 // enter in first row
    matrix[matrix.length - 1][matrix.length - 2] = 0 // remove last wall
    return matrix
  }
}