import { Vector3 } from 'three'
import { normalizeMouse } from '/utils/helpers.js'

class FirstPersonControls {

  constructor(object, domElement) {

    this.camera = object
    this.domElement = domElement
    this.mouse = { x: 0, y: 0 }

    // API
    this.movementSpeed = 5
    this.lookSpeed = 2

    // internals

    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false

    this.viewHalfX = 0
    this.viewHalfY = 0

    this.lat = 0
    this.lon = 0

    this.onKeyDown = event => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': this.moveForward = true; break

        case 'ArrowLeft':
        case 'KeyA': this.moveLeft = true; break

        case 'ArrowDown':
        case 'KeyS': this.moveBackward = true; break

        case 'ArrowRight':
        case 'KeyD': this.moveRight = true; break

        case 'KeyR': this.moveUp = true; break
        case 'KeyF': this.moveDown = true; break
      }
    }

    this.onKeyUp = event => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW': this.moveForward = false; break

        case 'ArrowLeft':
        case 'KeyA': this.moveLeft = false; break

        case 'ArrowDown':
        case 'KeyS': this.moveBackward = false; break

        case 'ArrowRight':
        case 'KeyD': this.moveRight = false; break

        case 'KeyR': this.moveUp = false; break
        case 'KeyF': this.moveDown = false; break
      }
    }

    this.domElement.addEventListener('pointermove', event => {
      this.mouse = normalizeMouse(event)
    })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  update(delta) {
    const targetPosition = new Vector3()
    const actualMoveSpeed = delta * this.movementSpeed

    if (this.moveForward) this.camera.translateZ(-actualMoveSpeed)
    if (this.moveBackward) this.camera.translateZ(actualMoveSpeed)

    if (this.moveLeft) this.camera.translateX(- actualMoveSpeed)
    if (this.moveRight) this.camera.translateX(actualMoveSpeed)

    if (this.moveUp) this.camera.translateY(actualMoveSpeed)
    if (this.moveDown) this.camera.translateY(- actualMoveSpeed)

    const deltaSpeed = delta * this.lookSpeed

    this.lon -= this.mouse.x * deltaSpeed
    this.lat += this.mouse.y * deltaSpeed
    this.lat = Math.max(-.1, Math.min(Math.PI / 4, this.lat)) // vertical min, max

    const { position } = this.camera
    targetPosition.setFromSphericalCoords(1, Math.PI / 2 - this.lat, this.lon).add(position)
    this.camera.lookAt(targetPosition)
  }
}

export { FirstPersonControls }