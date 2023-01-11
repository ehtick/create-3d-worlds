/* source: simpleGame.js
   Main code and design: Andy Harris - 2011/2012
*/
export default function Sprite(imageFile, width, height) {
  this.image = new Image()
  this.image.src = imageFile
  this.width = width
  this.height = height
  this.x = 0
  this.y = 5
  this.dx = 1
  this.dy = 0
  this.moveAngle = 0
  this.speed = 1

  this.setImage = function(imgFile) {
    this.image.src = imgFile
  }

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
  this.addVector = function(degrees, thrust) {
    // offset angle by 90 degrees
    degrees -= 90
    const angle = degrees * Math.PI / 180
    // calculate dx and dy
    const newDX = thrust * Math.cos(angle)
    const newDY = thrust * Math.sin(angle)
    this.dx += newDX
    this.dy += newDY

    // ensure speed and angle are updated
    this.calcSpeedAngle()
  }
}
