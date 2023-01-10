/* simpleGame.js
   a very basic game library for the canvas tag
   loosely based on Python gameEngine
   and Scratch
   expects an HTML5-compliant browser
   includes support for mobile browsers

   Main code and design: Andy Harris - 2011/2012
*/

// Boundary action constants
const WRAP = 0, BOUNCE = 1, STOP = 3, DIE = 4

export function Sprite(scene, imageFile, width, height) {
  // core class for game engine
  this.scene = scene
  this.canvas = scene.canvas
  this.context = this.canvas.getContext('2d')
  this.image = new Image()
  this.image.src = imageFile
  this.width = width
  this.height = height
  this.cHeight = parseInt(this.canvas.height)
  this.cWidth = parseInt(this.canvas.width)
  this.x = 200
  this.y = 200
  this.dx = 10
  this.dy = 0
  this.imgAngle = 0
  this.moveAngle = 0
  this.speed = 10
  this.camera = false
  this.visible = true
  this.boundAction = WRAP

  this.setImage = function(imgFile) {
    this.image.src = imgFile
  }

  this.setPosition = function(x, y) {
    // position is position of center
    this.x = x
    this.y = y
  }

  this.setX = function(nx) {
    this.x = nx
  }
  this.setY = function(ny) {
    this.y = ny
  }
  this.setChangeX = function(ndx) {
    this.dx = ndx
  }
  this.setChangeY = function(ndy) {
    this.dy = ndy
  }
  this.setDX = function(newDX) {
    this.dx = newDX
  }
  this.setDY = function(newDY) {
    this.dy = newDY
  }
  this.changeXby = function(tdx) {
    this.x += tdx
  }
  this.changeYby = function(tdy) {
    this.y += tdy
  }
  this.hide = function() {
    this.visible = false
  }
  this.show = function() {
    this.visible = true
  }

  this.draw = function() {
    // draw self on canvas;
    // intended only to be called from update, should never
    // need to be deliberately called by user
    const ctx = this.context
    ctx.save()

    // transform element
    ctx.translate(this.x, this.y)
    ctx.rotate(this.imgAngle)

	  ctx.drawImage(this.image,
      0 - (this.width / 2),
      0 - (this.height / 2),
      this.width, this.height)

    ctx.restore()
  }

  this.update = function() {
    this.x += this.dx
    this.y += this.dy
    this.checkBounds()
    if (this.visible)
      this.draw()
  }

  this.setBoundAction = function(action) {
    this.boundAction = action
  }

  this.checkBounds = function() {
    // behavior changes based on
    // boundAction property

    let camX = 0
    let camY = 0
    if (this.camera) {
      camX = this.camera.cameraOffsetX; camY = this.camera.cameraOffsetY
    }
    const rightBorder = this.cWidth + camX
    const leftBorder = camX
    const topBorder = camY
    const bottomBorder = this.cHeight + camY

    let offRight = false
    let offLeft = false
    let offTop = false
    let offBottom = false

    if (this.x > rightBorder)
      offRight = true

    if (this.x < leftBorder)
      offLeft = true

    if (this.y > bottomBorder)
      offBottom = true

    if (this.y < 0)
      offTop = true

    if (this.boundAction == WRAP) {
      if (offRight)
        this.x = leftBorder

      if (offBottom)
        this.y = topBorder

      if (offLeft)
        this.x = rightBorder

      if (offTop)
        this.y = bottomBorder

    } else if (this.boundAction == BOUNCE) {
      if (offTop || offBottom) {
        this.dy *= -1
        this.calcSpeedAngle()
        this.imgAngle = this.moveAngle
      }

      if (offLeft || offRight) {
        this.dx *= -1
        this.calcSpeedAngle()
        this.imgAngle = this.moveAngle
      }

    } else if (this.boundAction == STOP) {
      if (offLeft || offRight || offTop || offBottom)
        this.setSpeed(0)

    } else if (this.boundAction == DIE) {
      if (offLeft || offRight || offTop || offBottom) {
        this.hide()
        this.setSpeed(0)
      }

    } else {
      // keep on going forever
    }
  }

  this.calcVector = function() {
    // used throughout speed / angle calculations to
    // recalculate dx and dy based on speed and angle
    this.dx = this.speed * Math.cos(this.moveAngle)
    this.dy = this.speed * Math.sin(this.moveAngle)
  }

  this.calcSpeedAngle = function() {
    // opposite of calcVector:
    // sets speed and moveAngle based on dx, dy
    this.speed = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
    this.moveAngle = Math.atan2(this.dy, this.dx)
  }

  this.setSpeed = function(speed) {
    this.speed = speed
    this.calcVector()
  }

  this.getSpeed = function() {
    // calculate speed based on current dx and dy
    const speed = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
    return speed
  }

  this.changeSpeedBy = function(diff) {
    this.speed += diff
    this.calcVector()
  }

  this.setImgAngle = function(degrees) {
    // offset degrees by 90
    degrees -= 90
    // convert degrees to radians
    this.imgAngle = degrees * Math.PI / 180
  }

  this.getImgAngle = function() {
    // imgAngle is stored in radians.
    // return it in degrees
    // don't forget we offset the angle by 90 degrees
    return (this.imgAngle * 180 / Math.PI) + 90
  }

  this.setMoveAngle = function(degrees) {
    // take movement angle in degrees
    // offset degrees by 90
    degrees -= 90
    // convert to radians
    this.moveAngle = degrees * Math.PI / 180
    this.calcVector()
  } // end setMoveAngle

  this.getMoveAngle = function() {
    // moveAngle is stored in radians.
    // return it in degrees
    // don't forget we offset the angle by 90 degrees
    return (this.moveAngle * 180 / Math.PI) + 90
  }

  // convenience functions combine move and img angles
  this.setAngle = function(degrees) {
    this.setMoveAngle(degrees)
    this.setImgAngle(degrees)
  } // end setAngle

  this.turnBy = function(degrees) {
    // same as changeAngleBy
    this.changeAngleBy(degrees)
  }

  this.addVector = function(degrees, thrust) {
    // Modify the current motion vector by adding a new vector to it.

    // offset angle by 90 degrees
    degrees -= 90
    // input angle is in degrees - convert to radians
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

export function Scene() {
  const canvas = this.canvas = document.createElement('canvas')
  canvas.style.backgroundColor = 'yellow'
  canvas.width = 800
  canvas.height = 600
  canvas.style.backgroundColor = 'black'
  document.body.appendChild(canvas)
  this.context = canvas.getContext('2d')

  this.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
