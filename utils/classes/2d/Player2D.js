import input from '../Input.js'

const CIRCLE = Math.PI * 2

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
    const dx = Math.cos(this.angle) * speed
    const dy = Math.sin(this.angle) * speed
    if (this.map.getFieldValue(this.x + dx, this.y) === 0) this.x += dx
    if (this.map.getFieldValue(this.x, this.y + dy) === 0) this.y += dy
  }

  turn(amount) {
    this.angle = (this.angle + amount) % CIRCLE
  }

  update() {
    this.checkKeys()
  }
}
