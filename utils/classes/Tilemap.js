import { randomMatrix, meshFromMatrix, fieldToPosition } from '/utils/mazes.js'
import { shuffle } from '/utils/helpers.js'

function getEmptyFields(matrix) {
  const fields = []
  matrix.forEach((row, z) => row.forEach((value, x) => {
    if (value < 1) fields.push([z, x])
  }))
  shuffle(fields)
  return fields
}

const gridCellToField = (row, column) => [row, column].map(i => 2 * i + 1)

export default class Tilemap {
  constructor(matrix = randomMatrix(), cellSize = 20) {
    this.matrix = matrix
    this.cellSize = cellSize
    this.mapSize = (matrix.length - 1) * cellSize
  }

  fieldToPosition(field) {
    return fieldToPosition(this.matrix, field, this.cellSize)
  }

  gridCellToPosition(row, column) {
    return this.fieldToPosition(gridCellToField(row, column))
  }

  meshFromMatrix(params = {}) {
    return meshFromMatrix({ matrix: this.matrix, size: this.cellSize, ...params })
  }

  getEmptyCoords() {
    return getEmptyFields(this.matrix).map(field => this.fieldToPosition(field))
  }
}
