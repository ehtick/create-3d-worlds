import { randomMatrix, meshFromMatrix, fieldToPosition } from '/utils/mazes.js'
import { shuffle } from '/utils/helpers.js'

function getEmptyFields(matrix) {
  const fields = []
  matrix.forEach((row, rowI) => row.forEach((field, colI) => {
    if (!field) fields.push([colI, rowI])
  }))
  shuffle(fields)
  return fields
}

function gridCellToField(row, column) {
  const translate = i => 2 * i + 1
  return [translate(row), translate(column)]
}

export default class Tilemap {
  constructor(matrix = randomMatrix(), cellSize = 20) {
    this.matrix = matrix
    this.cellSize = cellSize
    this.mapSize = (matrix.length - 1) * cellSize
  }

  fieldToPosition(field) {
    return fieldToPosition (this.matrix, field, this.cellSize)
  }

  gridCellToPosition(row, column) {
    const field = gridCellToField(row, column)
    return this.fieldToPosition(field)
  }

  meshFromMatrix(params = {}) {
    return meshFromMatrix({ matrix: this.matrix, size: this.cellSize, ...params })
  }

  getEmptyCoords(toPosition = true) {
    const fields = getEmptyFields(this.matrix)
    return toPosition ? fields.map(field => this.fieldToPosition(field)) : fields
  }
}
