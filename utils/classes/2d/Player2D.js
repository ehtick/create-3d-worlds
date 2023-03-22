import input from '../Input.js'

const CIRCLE = Math.PI * 2

function getFieldValue(matrix, x, y) {
  x = Math.floor(x) // eslint-disable-line no-param-reassign
  y = Math.floor(y) // eslint-disable-line no-param-reassign
  if (x < 0 || x >= matrix[0].length || y < 0 || y >= matrix.length)
    return -1
  return matrix[y][x]
}

export default class Player2D {
  constructor(map, x, y, angle = 0) {
    this.x = x
    this.y = y
    this.angle = angle
    this.map = map
    this.speed = 0.03
  }

  get z() {
    return this.y
  }

  checkKeys() {
    if (input.left) this.turn(-this.speed)
    if (input.right) this.turn(this.speed)
    if (input.up) this.move()
    if (input.down) this.move(-this.speed / 2)
  }

  move(speed = this.speed) {
    const { matrix } = this.map
    const dx = Math.cos(this.angle) * speed
    const dy = Math.sin(this.angle) * speed
    if (getFieldValue(matrix, this.x + dx, this.y) === 0) this.x += dx
    if (getFieldValue(matrix, this.x, this.y + dy) === 0) this.y += dy
  }

  turn(amount) {
    this.angle = (this.angle + amount) % CIRCLE
  }

  update() {
    this.checkKeys()
  }
}
