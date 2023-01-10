/* global Sprite, Scene */
import keyboard from '/utils/classes/Keyboard.js'
import { clock } from '/utils/scene.js'

let message = ''
let fuel = 2000
const stats = document.getElementById('stats')

function showStats() {
  let output = 'MSG: ' + message + '<br />'
  output += 'Fuel: ' + fuel
  stats.innerHTML = output
}

class Lander extends Sprite {
  constructor(scene) {
    super(scene, 'lander.png', 50, 50)
    this.setSpeed(0)
    this.falling = true
    this.imgDefault = 'lander.png'
    this.imgUp = 'landerUp.png'
    this.imgLeft = 'landerLeft.png'
    this.imgRight = 'landerRight.png'
  }

  checkGravity(dt) {
    if (this.falling)
      this.addVector(180, .2 * dt)
  }

  handleInput(dt) {
    this.setImage(this.imgDefault)
    if (fuel < 1) return

    if (keyboard.down) {
      this.setImage(this.imgUp)
      this.addVector(0, .9 * dt)
      this.falling = true
      fuel--
    }

    if (fuel < .5) return

    if (keyboard.left) {
      this.setImage(this.imgLeft)
      this.addVector(90, 1 * dt)
      fuel -= 0.5
    }

    if (keyboard.right) {
      this.setImage(this.imgRight)
      this.addVector(270, 1 * dt)
      fuel -= 0.5
    }
  }

  checkLanding(platform) {
    if (this.falling && this.y > 525
      && this.x < platform.x + 10 && this.x > platform.x - 10
      && this.dx < .2 && this.dx > -.2 && this.dy < 2
    ) {
      this.setSpeed(0)
      this.falling = false
      message = 'Nice Landing!'
    }
  }
}

class Platform extends Sprite {
  constructor(scene) {
    super(scene, 'platform.png', 50, 10)
    this.setSpeed(0)
    const x = Math.random() * scene.width
    this.setPosition(x, 550)
  }
}

/* INIT */

const scene = new Scene()
scene.setBG('black')
scene.start()

const lander = new Lander(scene)
const platform = new Platform(scene)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  scene.clear()

  lander.checkGravity(dt)
  if (fuel > 0) lander.handleInput(dt)
  lander.checkLanding(platform)
  lander.update()

  platform.update()
  showStats()
}()

window.update = () => {}
