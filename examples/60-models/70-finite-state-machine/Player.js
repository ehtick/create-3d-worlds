import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

export default class Player {
  constructor({ mesh }) {
    this.mesh = mesh
    this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
    this._acceleration = new THREE.Vector3(1, 0.1, 10)
    this._velocity = new THREE.Vector3(0, 0, 0)
  }

  move(delta, dir = 1) {
    const acceleration = this._acceleration.clone()
    if (keyboard.capsLock) acceleration.multiplyScalar(2.0)

    this._velocity.z += dir * acceleration.z * delta

    const forward = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.mesh.quaternion).normalize()
      .multiplyScalar(this._velocity.z * delta)
    this.mesh.position.add(forward)
  }

  turn(delta, dir = 1) {
    const _A = new THREE.Vector3().set(0, 1, 0)
    const _Q = new THREE.Quaternion()
      .setFromAxisAngle(_A, dir * 4 * Math.PI * delta * this._acceleration.y)
    const _R = this.mesh.quaternion.clone().multiply(_Q)
    this.mesh.quaternion.copy(_R)

    const sideways = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(this.mesh.quaternion).normalize()
      .multiplyScalar(this._velocity.x * delta)
    this.mesh.position.add(sideways)
  }

  deaccelerate(delta) {
    const frameDecceleration = new THREE.Vector3()
      .multiplyVectors(this._velocity, this._decceleration).multiplyScalar(delta)

    const { z } = frameDecceleration
    frameDecceleration.z = Math.sign(z) * Math.min(Math.abs(z), Math.abs(this._velocity.z))
    this._velocity.add(frameDecceleration)
  }

  update(delta) {
    if (keyboard.up) this.move(delta, -1)
    if (keyboard.down) this.move(delta, 1)

    if (keyboard.left) this.turn(delta, 1)
    if (keyboard.right) this.turn(delta, -1)

    this.deaccelerate(delta)
  }
}
