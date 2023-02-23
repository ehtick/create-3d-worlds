import { randomMatrix, meshFromMatrix } from '/utils/mazes.js'
import { shuffle } from '/utils/helpers.js'

function getFieldValue(matrix, x, z) {
  x = Math.floor(x) // eslint-disable-line no-param-reassign
  z = Math.floor(z) // eslint-disable-line no-param-reassign
  if (x < 0 || x >= matrix[0].length || z < 0 || z >= matrix.length)
    return -1
  return matrix[z][x]
}

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
    return getFieldValue(this.matrix, x, y)
  }

  meshFromMatrix(params = {}) {
    return meshFromMatrix({ matrix: this.matrix, size: this.cellSize, origin: this.origin, ...params })
  }

  * yieldRandomField() {
    const fields = getEmptyFields(this.matrix)
    for (let i = 0; i < fields.length; i++)
      yield fields[i]

    console.log(`No more fields to yield (total ${fields.length}).`)
  }

  * yieldRandomCoord() {
    const fields = getEmptyFields(this.matrix)
    for (let i = 0; i < fields.length; i++)
      yield this.fieldToPosition(fields[i])

    console.log(`No more fields to yield (total ${fields.length}).`)
  }
}
