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

export default class Tilemap {
  constructor(matrix = randomMatrix(), cellSize = 20, origin) {
    const defaultOrigin = {
      x: -matrix[0].length * cellSize / 2,
      z: -matrix.length * cellSize / 2
    }
    this.matrix = matrix
    this.cellSize = cellSize
    this.mapSize = (matrix.length - 1) * cellSize
    this.origin = origin ? origin : defaultOrigin
  }

  getRelativePos(player) {
    return {
      x: (player.x - this.origin.x) / this.mapSize,
      y: (player.z - this.origin.z) / this.mapSize
    }
  }

  fieldToPosition([x, z]) {
    const posX = x * this.cellSize + this.origin.x
    const posZ = z * this.cellSize + this.origin.z
    return { x: posX + this.cellSize / 2, y: 0, z: posZ + this.cellSize / 2 }
  }

  getFieldValue(x, y) {
    x = Math.floor(x) // eslint-disable-line no-param-reassign
    y = Math.floor(y) // eslint-disable-line no-param-reassign
    if (x < 0 || x >= this.matrix[0].length || y < 0 || y >= this.matrix.length)
      return -1
    return this.matrix[y][x]
  }

  meshFromMatrix(params = {}) {
    return meshFromMatrix({ matrix: this.matrix, size: this.cellSize, origin: this.origin, ...params })
  }

  * yieldRandomEmpty(fieldOnly = false) {
    const fields = getEmptyFields(this.matrix)
    for (let i = 0; i < fields.length; i++)
      yield fieldOnly ? fields[i] : this.fieldToPosition(fields[i])

    console.log(`No more empty fields to yield (total ${fields.length}).`)
  }
}
