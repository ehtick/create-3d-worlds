/* global Sprite, Scene */
import keyboard from '/utils/classes/Keyboard.js'

let message = ''
let fuel = 2000

const scene = new Scene()
scene.setBG('black')
const lander = new Lander()
const platform = new Platform()
const stats = document.getElementById('stats')
scene.start()

function Lander() {
  const lander = new Sprite(scene, 'images/lander.png', 50, 50)
  lander.setSpeed(0)
  lander.falling = true
  lander.imgDefault = 'images/lander.png'
  lander.imgUp = 'images/landerUp.png'
  lander.imgLeft = 'images/landerLeft.png'
  lander.imgRight = 'images/landerRight.png'

  lander.checkGravity = function() {
    if (this.falling)
      this.addVector(180, .1)
  }

  lander.proveriTipke = function() {
    this.setImage(this.imgDefault)
    if (keyboard.down) {
      this.setImage(this.imgUp)
      this.addVector(0, .3)
      this.falling = true
      fuel--
    }

    if (keyboard.left) {
      this.setImage(this.imgLeft)
      this.addVector(90, .1)
      fuel -= 0.5
    }

    if (keyboard.right) {
      this.setImage(this.imgRight)
      this.addVector(270, .1)
      fuel -= 0.5
    }
  }

  lander.showStats = function() {
    let output = 'MSG: ' + message + '<br />'
    output += 'Fuel: ' + fuel
    stats.innerHTML = output
  }

  lander.checkLanding = function() {
    if (this.falling && this.y > 525 && this.x < platform.x + 10 && this.x > platform.x - 10
      && this.dx < .2 && this.dx > -.2 && this.dy < 2) {
      this.setSpeed(0)
      this.falling = false
      message = 'Nice Landing!'
    }
  }
  return lander
}

function Platform() {
  const platform = new Sprite(scene, 'images/platform.png', 50, 10)
  platform.setSpeed(0)
  const x = Math.random() * scene.width
  platform.setPosition(x, 550)
  return platform
}

/* LOOP */

let i = 0

void function loop() {
  requestAnimationFrame(loop)
  if (i++ % 2) return

  scene.clear()
  lander.checkGravity()
  if (fuel > 0)
    lander.proveriTipke()
  else {
    fuel = 0
    lander.setImage(lander.imgDefault)
  }
  lander.showStats()
  lander.checkLanding()

  lander.update()
  platform.update()
}()