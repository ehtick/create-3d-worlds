/* credit to simon dev */
import * as THREE from 'three'
import { mapRange } from '/utils/helpers.js'
import input from '/utils/classes/Input.js'

let oldY = 0
let fallingTime = 0

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

export default class ThirdPersonCamera {
  constructor({ camera, mesh, offset = [0, 2, 4], lookAt = [0, 2, 0], speed = 3 }) {
    this.mesh = mesh
    this.camera = camera
    this.offset = offset
    this.lookAt = lookAt
    this.speed = speed
    this.currentPosition = new THREE.Vector3()
    this.currentLookat = new THREE.Vector3()
  }

  updateCurrentPosition() {
    this.currentPosition.copy(this.camera.position)
  }

  update(delta) {
    const { y } = this.mesh.position
    const newLookAt = [...this.lookAt]

    // if long falling move camera down
    if (y - oldY < 0) {
      if (fallingTime > 25) newLookAt[1] = 0
      fallingTime++
    } else
      fallingTime = 0

    const idealPosition = calc(this.mesh, this.offset)
    const idealLookAt = calc(this.mesh, newLookAt)

    const t = this.speed * delta * (input.run ? 2 : 1)
    this.currentPosition.lerp(idealPosition, t)
    this.currentLookat.lerp(idealLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)

    oldY = y
  }
}
