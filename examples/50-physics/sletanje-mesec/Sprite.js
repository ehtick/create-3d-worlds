/* source: simpleGame.js, by Andy Harris - 2011/2012 */
export default function Sprite() {
  this.x = 0
  this.y = 5
  this.dx = 1
  this.dy = 0
  this.moveAngle = 0
  this.speed = 0

  this.setPosition = function(x, y) {
    this.x = x
    this.y = y
  }

  this.update = function() {
    this.x += this.dx
    this.y += this.dy
  }

  this.calcVector = function() {
    // used to recalculate dx and dy based on speed and angle
    this.dx = this.speed * Math.cos(this.moveAngle)
    this.dy = this.speed * Math.sin(this.moveAngle)
  }

  this.calcSpeedAngle = function() {
    // opposite of calcVector: sets speed and moveAngle based on dx, dy
    this.speed = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
    this.moveAngle = Math.atan2(this.dy, this.dx)
  }

  this.setSpeed = function(speed) {
    this.speed = speed
    this.calcVector()
  }

  // Modify the current motion vector by adding a new vector to it.
  this.addVector = function(angle, thrust) {
    const newDX = thrust * Math.cos(angle)
    const newDY = thrust * Math.sin(angle)
    this.dx += newDX
    this.dy += newDY

    // ensure speed and angle are updated
    this.calcSpeedAngle()
  }
}
