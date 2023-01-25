// https://codepen.io/viniciusSouza/pen/gOPVmKV
import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

const PI_HALF = Math.PI * .5

export default class FirstPersonControls {
  constructor(camera, mouseSensitivity = .002, speed = 120, jumpHeight = 40, height = 1.7) {
    this.mouseSensitivity = mouseSensitivity
    this.speed = speed
    this.height = height
    this.jumpHeight = jumpHeight

    this.canJump = false
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()

    camera.rotation.set(0, 0, 0)

    this.pitchObject = new THREE.Object3D()
    this.pitchObject.add(camera)

    this.yawObject = new THREE.Object3D()
    this.yawObject.position.y = height
    this.yawObject.add(this.pitchObject)

    document.addEventListener('mousemove', e => this.onMouseMove(e))
    document.addEventListener('keydown', e => this.onKeyDown(e))
  }

  onMouseMove(e) {
    if (!document.pointerLockElement) return

    this.yawObject.rotation.y -= e.movementX * this.mouseSensitivity

    this.pitchObject.rotation.x -= e.movementY * this.mouseSensitivity
    this.pitchObject.rotation.x = Math.max(-PI_HALF, Math.min(PI_HALF, this.pitchObject.rotation.x))
  }

  onKeyDown(event) {
    if (!document.pointerLockElement) return

    if (this.canJump && event.code == 'Space') {
      this.velocity.y += !keyboard.run ? this.jumpHeight : this.jumpHeight + 5
      this.canJump = false
    }
  }

  update(delta) {
    const { velocity, direction } = this
    const deltaX = 10 * delta
    velocity.add({ x: -velocity.x * deltaX, y: -9.8 * deltaX, z: -velocity.z * deltaX })

    direction.z = (keyboard.up ? 1 : 0) - (keyboard.down ? 1 : 0)
    direction.x = (keyboard.right ? 1 : 0) - (keyboard.left ? 1 : 0)
    direction.normalize()

    const currentSpeed = keyboard.run && (keyboard.up || keyboard.down || keyboard.left || keyboard.right)
      ? this.speed * 2.1
      : this.speed

    if (keyboard.up || keyboard.down)
      velocity.z -= direction.z * currentSpeed * delta

    if (keyboard.left || keyboard.right)
      velocity.x -= direction.x * currentSpeed * delta

    this.yawObject.translateX(-velocity.x * delta)
    this.yawObject.translateY(velocity.y * delta)
    this.yawObject.translateZ(velocity.z * delta)

    if (this.yawObject.position.y < this.height) {
      velocity.y = 0
      this.yawObject.position.y = this.height
      this.canJump = true
    }
  }
}