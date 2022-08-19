import Grid from './Grid.js'
import PolarCell from './PolarCell.js'

export default class PolarGrid extends Grid {
  constructor(rows) {
    super(rows, 1)
  }

  prepare_grid() {
    const rows = new Array(this.rows)
    const row_height = 1 / this.rows
    rows[0] = [new PolarCell(0, 0)]

    for (let i = 1; i < this.rows; i += 1) {
      const radius = i * 1 / this.rows
      const circumference = 2 * Math.PI * radius

      const previous_count = rows[i - 1].length
      const estimated_cell_width = circumference / previous_count
      const ratio = Math.round(estimated_cell_width / row_height)

      const cells = previous_count * ratio
      rows[i] = new Array(cells)
      for (let j = 0; j < cells; j += 1)
        rows[i][j] = new PolarCell(i, j)
    }
    this.grid = rows
  }

  configure_cells() {
    for (const cell of this.each_cell()) {
      const { row, column } = cell
      if (row == 0) continue

      cell.cw = this.cell(row, column + 1)
      cell.ccw = this.cell(row, column - 1)
      const ratio = this.grid[row].length / this.grid[row - 1].length
      const parent = this.grid[row - 1][Math.floor(column / ratio)]
      parent.outward.push(cell)
      cell.inward = parent
    }
  }

  cell(row, column) {
    if (row < 0 || row > this.rows - 1) return null
    return this.grid[row][column % this.grid[row].length]
  }

  get random_cell() {
    const row = Math.floor(Math.random() * this.rows)
    const col = Math.floor(Math.random() * this.grid[row].length)
    return this.cell(row, col)
  }
}