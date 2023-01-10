/* simpleGame.js
   Main code and design: Andy Harris - 2011/2012
*/

export function Sprite(imageFile, width, height) {
  this.image = new Image()
  this.image.src = imageFile
  this.width = width
  this.height = height
  this.x = 200
  this.y = 200
  this.dx = 10
  this.dy = 0
  this.moveAngle = 0
  this.speed = 10

  this.setImage = function(imgFile) {
    this.image.src = imgFile
  }

  this.setPosition = function(x, y) {
    // position is position of center
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

export function Renderer() {
  const canvas = this.canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  canvas.style.backgroundColor = 'black'
  document.body.appendChild(canvas)
  this.context = canvas.getContext('2d')

  this.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  this.draw = function(sprite) {
    const { context } = this
    context.save()

    context.translate(sprite.x, sprite.y)

	  context.drawImage(sprite.image,
      0 - (sprite.width / 2),
      0 - (sprite.height / 2),
      sprite.width, sprite.height)

    context.restore()
  }
}
