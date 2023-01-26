import { Vector3 } from 'three'
import { normalizeMouse } from '/utils/helpers.js'

class FirstPersonControls {

  constructor(object, domElement) {

    this.object = object
    this.domElement = domElement
    this.mouse = { x: 0, y: 0 }

    // API
    this.movementSpeed = 5
    this.lookSpeed = 2
    this.lookVertical = true

    // internals

    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false

    this.viewHalfX = 0
    this.viewHalfY = 0

    // private variables

    let lat = 0
    let lon = 0

    this.onPointerMove = function(event) {
      this.mouse = normalizeMouse(event)
    }

    this.onKeyDown = function(event) {
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

    this.onKeyUp = function(event) {
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

    this.update = function() {
      const targetPosition = new Vector3()

      return function update(delta) {
        const actualMoveSpeed = delta * this.movementSpeed

        if (this.moveForward) this.object.translateZ(-actualMoveSpeed)
        if (this.moveBackward) this.object.translateZ(actualMoveSpeed)

        if (this.moveLeft) this.object.translateX(- actualMoveSpeed)
        if (this.moveRight) this.object.translateX(actualMoveSpeed)

        if (this.moveUp) this.object.translateY(actualMoveSpeed)
        if (this.moveDown) this.object.translateY(- actualMoveSpeed)

        const deltaSpeed = delta * this.lookSpeed

        lon -= this.mouse.x * deltaSpeed
        if (this.lookVertical) lat += this.mouse.y * deltaSpeed

        lat = Math.max(-.1, Math.min(Math.PI / 4, lat)) // vertical min, max

        const { position } = this.object
        targetPosition.setFromSphericalCoords(1, Math.PI * .5 - lat, lon).add(position)
        this.object.lookAt(targetPosition)
      }
    }()

    const _onPointerMove = this.onPointerMove.bind(this)
    const _onKeyDown = this.onKeyDown.bind(this)
    const _onKeyUp = this.onKeyUp.bind(this)

    this.domElement.addEventListener('pointermove', _onPointerMove)

    window.addEventListener('keydown', _onKeyDown)
    window.addEventListener('keyup', _onKeyUp)
  }
}

export { FirstPersonControls }