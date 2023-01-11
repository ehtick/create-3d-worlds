import * as THREE from 'three'
import { scene, camera, renderer, clock, setBackground } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox } from '/utils/geometry.js'

import Sprite from './Sprite.js'
import keyboard from '/utils/classes/Keyboard.js'

const { randFloat } = THREE.MathUtils

let message = ''
let fuel = 2000
const stats = document.getElementById('stats')

function showStats() {
  let output = 'MSG: ' + message + '<br />'
  output += 'Fuel: ' + fuel
  stats.innerHTML = output
}

/* CLASSES */

class Lander extends Sprite {
  constructor() {
    super()
    this.setSpeed(0)
    this.falling = true
  }

  applyGravity(dt) {
    if (this.falling) this.addVector(-Math.PI / 2, .02 * dt)
  }

  handleInput(dt) {
    if (fuel < 1) return

    if (keyboard.down) {
      this.addVector(Math.PI / 2, .09 * dt)
      this.falling = true
      fuel--
    }

    if (fuel < .5) return

    if (keyboard.left) {
      this.addVector(0, .1 * dt)
      fuel -= 0.5
    }

    if (keyboard.right) {
      this.addVector(Math.PI, .1 * dt)
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

/* INIT */

const sun = createSun()
sun.position.set(30, 0, 30)
scene.add(sun)
setBackground(0x000000)
camera.position.z = 20

const { mesh: landerMesh } = await loadModel({ file: 'space/lunar-module/model.fbx' })
scene.add(landerMesh)
landerMesh.position.y = 5

const platforma = createBox({ width: 5, height: 1, depth: 2.5 })
platforma.position.y = -10
platforma.position.x = randFloat(-30, 30)
scene.add(platforma)

const lander = new Lander()

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()

  lander.applyGravity(dt)
  lander.handleInput(dt)
  // lander.checkLanding(platform)
  lander.update(dt)

  showStats()

  landerMesh.position.set(lander.x, lander.y, 0)
  renderer.render(scene, camera)
}()
