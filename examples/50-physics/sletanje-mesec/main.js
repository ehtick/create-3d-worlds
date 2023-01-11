import Sprite from './Sprite.js'
import Renderer from './Renderer.js'
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
  constructor() {
    super('lander.png', 50, 50)
    this.setSpeed(0)
    this.falling = true
  }

  applyGravity(dt) {
    if (this.falling)
      this.addVector(180, .2 * dt)
  }

  handleInput(dt) {
    this.setImage('lander.png')

    if (fuel < 1) return

    if (keyboard.down) {
      this.setImage('landerUp.png')
      this.addVector(0, .9 * dt)
      this.falling = true
      fuel--
    }

    if (fuel < .5) return

    if (keyboard.left) {
      this.setImage('landerLeft.png')
      this.addVector(90, 1 * dt)
      fuel -= 0.5
    }

    if (keyboard.right) {
      this.setImage('landerRight.png')
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
  constructor() {
    super('platform.png', 50, 10)
    this.setSpeed(0)
    this.setPosition(Math.random() * 600 + 100, 550)
  }
}

/* INIT */

const scene = new Renderer()
const lander = new Lander()
const platform = new Platform()

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()

  lander.applyGravity(dt)
  lander.handleInput(dt)
  lander.checkLanding(platform)
  lander.update(dt)

  platform.update()

  scene.clear()
  scene.draw(lander)
  scene.draw(platform)

  showStats()
}()
