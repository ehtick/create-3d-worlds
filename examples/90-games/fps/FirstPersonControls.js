import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

const PI_2 = Math.PI / 2

export default class FirstPersonControls {
  constructor(camera, mouseMoveSensitivity = .002, speed = 120, jumpHeight = 150, height = 1.7) {
    this.mouseMoveSensitivity = mouseMoveSensitivity
    this.speed = speed
    this.height = height
    this.jumpHeight = jumpHeight

    this.canJump = false
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    this.prevTime = performance.now()

    camera.rotation.set(0, 0, 0)

    this.pitchObject = new THREE.Object3D()
    this.pitchObject.add(camera)

    this.yawObject = new THREE.Object3D()
    this.yawObject.position.y = height
    this.yawObject.add(this.pitchObject)

    document.addEventListener('mousemove', e => this.onMouseMove(e))
    document.addEventListener('keydown', e => this.onKeyDown(e))

    this.enabled = false
  }

  getObject() {
    return this.yawObject
  }

  update() {
    const { velocity, direction } = this
    const time = performance.now()
    const delta = (time - this.prevTime) / 1000

    velocity.y -= 9.8 * 100 * delta
    velocity.x -= velocity.x * 10 * delta
    velocity.z -= velocity.z * 10 * delta

    direction.z = (keyboard.up ? 1 : 0) - (keyboard.down ? 1 : 0)
    direction.x = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0)
    direction.normalize()

    let currentSpeed = this.speed
    if (keyboard.run && (keyboard.up || keyboard.down || keyboard.left || keyboard.right))
      currentSpeed += (currentSpeed * 1.1)

    if (keyboard.up || keyboard.down) velocity.z -= direction.z * currentSpeed * delta
    if (keyboard.left || keyboard.right) velocity.x -= direction.x * currentSpeed * delta

    this.getObject().translateX(-velocity.x * delta)
    this.getObject().translateZ(velocity.z * delta)

    this.getObject().position.y += (velocity.y * delta)

    if (this.getObject().position.y < this.height) {
      velocity.y = 0
      this.getObject().position.y = this.height
      this.canJump = true
    }
    this.prevTime = time
  }

  onMouseMove(event) {
    if (this.enabled === false) return

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    this.yawObject.rotation.y -= movementX * this.mouseMoveSensitivity
    this.pitchObject.rotation.x -= movementY * this.mouseMoveSensitivity

    this.pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, this.pitchObject.rotation.x))
  }

  onKeyDown(event) {
    if (this.enabled === false) return
    switch (event.code) {
      case 'Space':
        if (this.canJump === true) this.velocity.y += (!keyboard.run) ? this.jumpHeight : this.jumpHeight + 5
        this.canJump = false
        break
    }
  }

  dispose() {
    document.removeEventListener('mousemove', e => this.onMouseMove(e))
    document.removeEventListener('keydown', e => this.onKeyDown(e))
  }
}