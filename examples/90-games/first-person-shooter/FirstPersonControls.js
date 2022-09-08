import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

const FirstPersonControls = function(camera, MouseMoveSensitivity = 0.002, speed = 800.0, jumpHeight = 350.0, height = 30.0) {
  const self = this

  self.MouseMoveSensitivity = MouseMoveSensitivity
  self.speed = speed
  self.height = height
  self.jumpHeight = self.height + jumpHeight
  self.click = false

  let canJump = false

  const velocity = new THREE.Vector3()
  const direction = new THREE.Vector3()

  let prevTime = performance.now()

  camera.rotation.set(0, 0, 0)

  const pitchObject = new THREE.Object3D()
  pitchObject.add(camera)

  const yawObject = new THREE.Object3D()
  yawObject.position.y = 10
  yawObject.add(pitchObject)

  const PI_2 = Math.PI / 2

  const onMouseMove = function(event) {
    if (self.enabled === false) return

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    yawObject.rotation.y -= movementX * self.MouseMoveSensitivity
    pitchObject.rotation.x -= movementY * self.MouseMoveSensitivity

    pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, pitchObject.rotation.x))
  }

  const onKeyDown = event => {
    if (self.enabled === false) return
    switch (event.keyCode) {
      case 32: // space
        if (canJump === true) velocity.y += (!keyboard.run) ? self.jumpHeight : self.jumpHeight + 50
        canJump = false
        break
    }
  }

  const onMouseDownClick = event => {
    if (self.enabled === false) return
    self.click = true
  }

  const onMouseUpClick = event => {
    if (self.enabled === false) return
    self.click = false
  }

  self.dispose = function() {
    document.removeEventListener('mousemove', onMouseMove, false)
    document.removeEventListener('keydown', onKeyDown, false)
    document.removeEventListener('mousedown', onMouseDownClick, false)
    document.removeEventListener('mouseup', onMouseUpClick, false)
  }

  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('keydown', onKeyDown, false)
  document.addEventListener('mousedown', onMouseDownClick, false)
  document.addEventListener('mouseup', onMouseUpClick, false)

  self.enabled = false

  self.getObject = function() {
    return yawObject
  }

  self.update = function() {
    const time = performance.now()
    const delta = (time - prevTime) / 1000

    velocity.y -= 9.8 * 100.0 * delta
    velocity.x -= velocity.x * 10.0 * delta
    velocity.z -= velocity.z * 10.0 * delta

    direction.z = (keyboard.up ? 1 : 0) - (keyboard.down ? 1 : 0)
    direction.x = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0)
    direction.normalize()

    let currentSpeed = self.speed
    if (keyboard.run && (keyboard.up || keyboard.down || keyboard.left || keyboard.right)) currentSpeed += (currentSpeed * 1.1)

    if (keyboard.up || keyboard.down) velocity.z -= direction.z * currentSpeed * delta
    if (keyboard.left || keyboard.right) velocity.x -= direction.x * currentSpeed * delta

    self.getObject().translateX(-velocity.x * delta)
    self.getObject().translateZ(velocity.z * delta)

    self.getObject().position.y += (velocity.y * delta)

    if (self.getObject().position.y < self.height) {
      velocity.y = 0
      self.getObject().position.y = self.height
      canJump = true
    }
    prevTime = time
  }
}

export default FirstPersonControls