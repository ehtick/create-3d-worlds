
import Sprite from './Sprite.js'
import keyboard from '/utils/classes/Keyboard.js'
import Thrust from '/utils/classes/Thrust.js'
import { getSize } from '/utils/helpers.js'

export default class Lander extends Sprite {
  constructor(mesh) {
    super(mesh)
    this.fuel = 2000
    this.thrust = new Thrust()
    this.mesh.add(this.thrust.mesh)
    this.thrustCleared = false
    this.failure = false
  }

  handleInput(dt) {
    if (!this.falling) return

    if (!keyboard.keyPressed)
      this.thrustCleared = false

    if (this.fuel < 1) return

    if (keyboard.down) {
      this.addThrust(dt, 0, [0, -1, 0])
      this.addVector(Math.PI / 2, .09 * dt)
      this.fuel--
    }

    if (this.fuel < .5) return

    if (keyboard.left) {
      this.addThrust(dt, -Math.PI * .5, [-1, 1, 0])
      this.addVector(0, .1 * dt)
      this.fuel -= 0.5
    }

    if (keyboard.right) {
      this.addThrust(dt, Math.PI * .5, [1, 1, 0])
      this.addVector(Math.PI, .1 * dt)
      this.fuel -= 0.5
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
    const { y: platformHeight } = getSize(platform)
    return this.mesh.position.y <= platform.position.y + platformHeight // -9
        && this.mesh.position.y > platform.position.y // -10
  }

  isSameWidth(platform) {
    const { x: platformWidth } = getSize(platform)
    return this.mesh.position.x > platform.position.x - platformWidth * .45
        && this.mesh.position.x < platform.position.x + platformWidth * .45
  }

  checkLanding(platform, dt) {
    if (!this.isSameHeight(platform) || !this.isSameWidth(platform)) return

    this.falling = false
    if (this.dy < -0.04) this.failure = true // must before setSpeed(0)
    this.setSpeed(0)

    if (this.failure) {
      this.mesh.rotation.z = Math.PI * .5
      this.addThrust(dt, Math.PI * .5, [0, -1, 0])
    }
  }

  showStats(element) {
    let html = 'Fuel: ' + this.fuel + '<br />'
    if (!this.falling) html += (this.failure ? 'Landing failure!' : 'Nice landing!')
    element.innerHTML = html
  }

  update(dt) {
    super.update(dt)
    this.thrust.updateParticles(dt)
  }
}
