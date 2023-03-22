import { randomMatrix, meshFromMatrix } from '/utils/mazes.js'
import { shuffle } from '/utils/helpers.js'

function getEmptyFields(matrix) {
  const fields = []
  matrix.forEach((row, y) => row.forEach((field, x) => {
    if (!field) fields.push([x, y])
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
    this.origin = {
      x: matrix[0].length * cellSize / 2,
      z: matrix.length * cellSize / 2
    }
  }

  fieldToPosition([x, z]) {
    const posX = x * this.cellSize - this.origin.x
    const posZ = z * this.cellSize - this.origin.z
    return { x: posX + this.cellSize / 2, y: 0, z: posZ + this.cellSize / 2 }
  }

  gridCellToPosition(row, column) {
    const cell = gridCellToField(row, column)
    return this.fieldToPosition(cell)
  }

  meshFromMatrix(params = {}) {
    return meshFromMatrix({ matrix: this.matrix, size: this.cellSize, ...params })
  }

  getEmptyCoords(toPosition = true) {
    const fields = getEmptyFields(this.matrix)
    return toPosition ? fields.map(field => this.fieldToPosition(field)) : fields
  }
}
