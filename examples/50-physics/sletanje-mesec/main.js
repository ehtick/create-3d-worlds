import * as THREE from 'three'
import { scene, camera, renderer, clock, setBackground } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox } from '/utils/geometry.js'

import Sprite from './Sprite.js'
import keyboard from '/utils/classes/Keyboard.js'
import Thrust from '/utils/classes/Thrust.js'

const { randFloat } = THREE.MathUtils

let message = ''
let fuel = 2000
const stats = document.getElementById('stats')

const platformWidth = 5, platformHeight = 1

function showStats() {
  let output = 'Fuel: ' + fuel + '<br />'
  output += message
  stats.innerHTML = output
}

/* CLASSES */

class Lander extends Sprite {
  constructor(mesh) {
    super(mesh)
    this.thrust = new Thrust()
    this.mesh.add(this.thrust.mesh)
    this.thrustCleared = false
  }

  handleInput(dt) {
    if (!this.falling) return

    if (!keyboard.keyPressed)
      this.thrustCleared = false

    if (fuel < 1) return

    if (keyboard.down) {
      this.addThrust(dt, 0, [0, -1, 0])
      this.addVector(Math.PI / 2, .09 * dt)
      fuel--
    }

    if (fuel < .5) return

    if (keyboard.left) {
      this.addThrust(dt, -Math.PI * .5, [-1, 1, 0])
      this.addVector(0, .1 * dt)
      fuel -= 0.5
    }

    if (keyboard.right) {
      this.addThrust(dt, Math.PI * .5, [1, 1, 0])
      this.addVector(Math.PI, .1 * dt)
      fuel -= 0.5
    }
  }

  addThrust(dt, angle, pos) {
    this.clearThrust()
    this.thrust.mesh.rotation.z = angle
    this.thrust.mesh.position.set(...pos)
    this.thrust.addParticles(dt)
  }

  clearThrust() {
    if (this.thrustCleared) return
    this.thrust.clear()
    this.thrustCleared = true
  }

  isSameHeight(platform) {
    return this.mesh.position.y <= platform.position.y + platformHeight
  }

  isSameWidth(platform) {
    return this.mesh.position.x > platform.position.x - platformWidth * .5 && this.mesh.position.x < platform.position.x + platformWidth * .5
  }

  checkLanding(platform) {
    if (
      this.isSameHeight(platform)
      && this.isSameWidth(platform)
    ) {
      // TODO: ako nije dovoljno sporo (this.dy > -.05), neuspešno sletanje
      this.setSpeed(0)
      this.falling = false
      message = 'Nice Landing!'
    }
  }

  update(dt) {
    super.update(dt)
    this.thrust.updateParticles(dt)
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

const platform = createBox({ width: platformWidth, height: platformHeight, depth: 2.5 })
platform.position.y = -10
platform.position.x = randFloat(-30, 30)
scene.add(platform)

const lander = new Lander(landerMesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()

  lander.handleInput(dt)
  lander.checkLanding(platform)
  lander.update(dt)

  showStats()

  renderer.render(scene, camera)
}()
