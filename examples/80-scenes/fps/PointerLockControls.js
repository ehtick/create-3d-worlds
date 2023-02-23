// https://codepen.io/viniciusSouza/pen/gOPVmKV
import * as THREE from 'three'
import input from '/utils/classes/Input.js'

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
    this.camera = camera

    this.mesh = new THREE.Object3D()
    this.mesh.position.y = height
    this.mesh.add(this.camera)

    document.addEventListener('mousemove', e => this.onMouseMove(e))
    document.addEventListener('keydown', e => this.onKeyDown(e))
  }

  onMouseMove(e) {
    this.mesh.rotation.y -= e.movementX * this.mouseSensitivity

    this.camera.rotation.x -= e.movementY * this.mouseSensitivity
    this.camera.rotation.x = Math.max(-PI_HALF, Math.min(PI_HALF, this.camera.rotation.x))
  }

  onKeyDown(event) {
    if (this.canJump && event.code == 'Space') {
      this.velocity.y += !input.run ? this.jumpHeight : this.jumpHeight + 5
      this.canJump = false
    }
  }

  update(delta) {
    const { velocity, direction } = this
    const deltaX = 10 * delta
    velocity.add({ x: -velocity.x * deltaX, y: -9.8 * deltaX, z: -velocity.z * deltaX })

    direction.z = (input.up ? 1 : 0) - (input.down ? 1 : 0)
    direction.x = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    direction.normalize()

    const currentSpeed = input.run && (input.up || input.down || input.left || input.right)
      ? this.speed * 2.1
      : this.speed

    if (input.up || input.down)
      velocity.z -= direction.z * currentSpeed * delta

    if (input.left || input.right)
      velocity.x -= direction.x * currentSpeed * delta

    this.mesh.translateX(-velocity.x * delta)
    this.mesh.translateY(velocity.y * delta)
    this.mesh.translateZ(velocity.z * delta)

    if (this.mesh.position.y < this.height) {
      velocity.y = 0
      this.mesh.position.y = this.height
      this.canJump = true
    }
  }
}