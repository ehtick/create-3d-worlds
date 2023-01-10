/* simpleGame.js
   a very basic game library for the canvas tag
   loosely based on Python gameEngine
   and Scratch
   expects an HTML5-compliant browser
   includes support for mobile browsers

   Main code and design: Andy Harris - 2011/2012
   Animation and tile elements by Tyler Mitchell
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
  this.animation = false // becomes Animation Class
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

  this.changeImage = function(imgFile) {
    this.image.src = imgFile
  } // end this.changeImage

  this.setImage = function(imgFile) {
    // set and change image are the same thing.
    this.image.src = imgFile
  } // end this.setImage

  this.setPosition = function(x, y) {
    // position is position of center
    this.x = x
    this.y = y
  } // end setPosition function

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
    // The following lines are for Tyler's code. Removed for now
    // if( this.camera ){ ctx.translate(this.x - this.camera.cameraOffsetX, this.y - this.camera.cameraOffsetY); }
    // else{ ctx.translate(this.x, this.y); }

    // transform element
    ctx.translate(this.x, this.y)
    ctx.rotate(this.imgAngle)

    // draw image with center on origin
    if (this.animation != false)
      this.animation.drawFrame(ctx)
	 else
	  ctx.drawImage(this.image,
        0 - (this.width / 2),
        0 - (this.height / 2),
        this.width, this.height)

    ctx.restore()

  } // end draw function

  this.update = function() {
    this.x += this.dx
    this.y += this.dy
    this.checkBounds()
    if (this.visible)
      this.draw()
    // end if
  } // end update

  this.setBoundAction = function(action) {
    this.boundAction = action
  } // end setBoundAction

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
      // end if

      if (offBottom)
        this.y = topBorder
      // end if

      if (offLeft)
        this.x = rightBorder
      // end if

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
  } // end checkbounds

  this.loadAnimation = function(imgWidth, imgHeight, cellWidth, cellHeight) {
    this.animation = new Animation(this.image, imgWidth, imgHeight, cellWidth, cellHeight)
    this.animation.setup()
  }

  // animation methods
  this.generateAnimationCycles = function(slicingFlag, framesArray) {
    // Default: assume each row is a cycle and give them names Cycle1, Cycle2, ... , CycleN
    // SINGLE_ROW: all the sprites are in one row on the sheet, the second parameter is either a number saying each cycle is that many frames or a list of how many frames each cycle is
    // SINGLE_COLUMN: all the sprites are in one column on the sheet, the second parameter is either a number saying each cycle is that many frames or a list of how many frames each cycle is
    // VARIABLE_LENGTH: How many frames are in each cycle. framesArray must be defined.
    cWidth = this.animation.cellWidth
    cHeight = this.animation.cellHeight
    iWidth = this.animation.imgWidth
    iHeight = this.animation.imgHeight
    numCycles = 0
    nextStartingFrame = 0
	  if (typeof framesArray == 'number' || typeof slicingFlag == 'undefined') {
	    if (slicingFlag == SINGLE_COLUMN) numCycles = (iHeight / cHeight) / framesArray; else if (typeof slicingFlag == 'undefined') {
        numCycles = (iHeight / cHeight); framesArray = iWidth / cWidth
      } else numCycles = (iWidth / cWidth) / framesArray
      for (i = 0; i < numCycles; i++) {
		  cycleName = 'cycle' + (i + 1)
		  this.specifyCycle(cycleName, i * framesArray, framesArray)
      }
	  } else {
	    numCycles = framesArray.length
      for (i = 0; i < numCycles; i++) {
		  cycleName = 'cycle' + (i + 1)
		  this.specifyCycle(cycleName, nextStartingFrame, framesArray[i])
		  nextStartingFrame += framesArray[i]
      }
	  }
    this.setCurrentCycle('cycle1')
  }

  this.renameCycles = function(cycleNames) {
    this.animation.renameCycles(cycleNames)
  }
  this.specifyCycle = function(cycleName, startingCell, frames) {
    this.animation.addCycle(cycleName, startingCell, frames)
  }
  this.specifyState = function(stateName, cellName) {
    this.animation.addCycle(stateName, cellName, 1)
  }
  this.setCurrentCycle = function(cycleName) {
    this.animation.setCycle(cycleName)
  }
  this.pauseAnimation = function() {
    this.animation.pause()
  }
  this.playAnimation = function() {
    this.animation.play()
  }
  this.resetAnimation = function() {
    this.animation.reset()
  }
  this.setAnimationSpeed = function(speed) {
    this.animation.setAnimationSpeed(speed)
  }

  this.calcVector = function() {
    // used throughout speed / angle calculations to
    // recalculate dx and dy based on speed and angle
    this.dx = this.speed * Math.cos(this.moveAngle)
    this.dy = this.speed * Math.sin(this.moveAngle)
  } // end calcVector

  this.calcSpeedAngle = function() {
    // opposite of calcVector:
    // sets speed and moveAngle based on dx, dy
    this.speed = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
    this.moveAngle = Math.atan2(this.dy, this.dx)
  }

  this.setSpeed = function(speed) {
    this.speed = speed
    this.calcVector()
  } // end setSpeed

  this.getSpeed = function() {
    // calculate speed based on current dx and dy
    const speed = Math.sqrt((this.dx * this.dx) + (this.dy * this.dy))
    return speed
  } // end getSpeed

  this.changeSpeedBy = function(diff) {
    this.speed += diff
    this.calcVector()
  } // end changeSpeedBy

  this.setImgAngle = function(degrees) {
    // offset degrees by 90
    degrees -= 90
    // convert degrees to radians
    this.imgAngle = degrees * Math.PI / 180
  } // end setImgAngle

  this.getImgAngle = function() {
    // imgAngle is stored in radians.
    // return it in degrees
    // don't forget we offset the angle by 90 degrees
    return (this.imgAngle * 180 / Math.PI) + 90
  }

  this.changeImgAngleBy = function(degrees) {
    rad = degrees * Math.PI / 180
    this.imgAngle += rad
  } // end changeImgAngle

  this.setMoveAngle = function(degrees) {
    // take movement angle in degrees
    // offset degrees by 90
    degrees -= 90
    // convert to radians
    this.moveAngle = degrees * Math.PI / 180
    this.calcVector()
  } // end setMoveAngle

  this.changeMoveAngleBy = function(degrees) {
    // convert diff to radians
    const diffRad = degrees * Math.PI / 180
    // add radian diff to moveAngle
    this.moveAngle += diffRad
    this.calcVector()
  } // end changeMoveAngleBy

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

  this.changeAngleBy = function(degrees) {
    this.changeMoveAngleBy(degrees)
    this.changeImgAngleBy(degrees)
  } // end changeAngleBy

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
  } // end addVector

  this.collidesWith = function(sprite) {
    // check for collision with another sprite

    // collisions only activated when both sprites are visible
    collision = false
    if (this.visible)

      if (sprite.visible) {
        // define borders
        myLeft = this.x - (this.width / 2)
        myRight = this.x + (this.width / 2)
        myTop = this.y - (this.height / 2)
        myBottom = this.y + (this.height / 2)
        otherLeft = sprite.x - (sprite.width / 2)
        otherRight = sprite.x + (sprite.width / 2)
        otherTop = sprite.y - (sprite.height / 2)
        otherBottom = sprite.y + (sprite.height / 2)

        // assume collision
        collision = true

        // determine non-colliding states
        if ((myBottom < otherTop) ||
	    (myTop > otherBottom) ||
	    (myRight < otherLeft) ||
	    (myLeft > otherRight))
	      collision = false
	 // end if

      } // end 'other visible' if
    // end 'I'm visible' if

    return collision
  } // end collidesWith

  this.distanceTo = function(sprite) {
    diffX = this.x - sprite.x
    diffY = this.y - sprite.y
    dist = Math.sqrt((diffX * diffX) + (diffY * diffY))
    return dist
  } // end distanceTo

  this.angleTo = function(sprite) {
    // get centers of sprites
    myX = this.x + (this.width / 2)
    myY = this.y + (this.height / 2)
    otherX = sprite.x + (sprite.width / 2)
    otherY = sprite.y + (sprite.height / 2)

    // calculate difference
    diffX = myX - otherX
    diffY = myY - otherY
    radians = Math.atan2(diffY, diffX)
    degrees = radians * 180 / Math.PI
    // degrees are offset
    degrees += 90
    return degrees
  } // end angleTo

  this.setCameraRelative = function(cam) {
    this.camera = cam
  }

  this.report = function() {
    // used only for debugging. Requires browser with JS console
    console.log ('x: ' + this.x + ', y: ' + this.y + ', dx: '
		   + this.dx + ', dy: ' + this.dy
		   + ', speed: ' + this.speed
		   + ', angle: ' + this.moveAngle)
  } // end report
} // end Sprite class def

export function Scene() {
  // dynamically create a canvas element
  this.canvas = document.createElement('canvas')
  this.canvas.style.backgroundColor = 'yellow'
  document.body.appendChild(this.canvas)
  this.context = this.canvas.getContext('2d')

  this.clear = function() {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  this.start = function() {
    // set up keyboard reader if not a touch screen.
    // removed this test as it was breaking on machines with both
    // touch and keyboard input
    this.intID = setInterval(localUpdate, 50)
    // document.mouseClicked = false
    // document.onmousedown = function() {
    //   this.mouseDown = true
    //   this.mouseClicked = true
    // }
    // document.onmouseup = function() {
    //   this.mouseDown = false
    //   this.mouseClicked = false
    // }
  }

  this.stop = function() {
    clearInterval(this.intID)
  }

  this.setSize = function(width, height) {
    // set the width and height of the canvas in pixels
    this.width = width
    this.height = height
    this.canvas.width = this.width
    this.canvas.height = this.height
  } // end setSize

  this.setPos = function(left, top) {
    // set the left and top position of the canvas
    // offset from the page
    this.left = left
    this.top = top
  }

  this.setBG = function(color) {
    this.canvas.style.backgroundColor = color
  }

  this.hide = function() {
    this.canvas.style.display = 'none'
  }

  this.show = function() {
    this.canvas.style.display = 'block'
  }

  this.setSize(800, 600)
  this.setPos(10, 10)
  this.setBG('lightgray')
}

function localUpdate() {
  // will be called once per frame
  // calls the update function defined by
  // the user
  window.update()
} // end localUpdate
