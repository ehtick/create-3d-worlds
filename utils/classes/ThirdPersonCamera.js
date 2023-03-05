/* credit to simon dev */
import * as THREE from 'three'
import input from '/utils/classes/Input.js'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

export default class ThirdPersonCamera {
  constructor({ camera, mesh, offset = [0, 1.5, 3.5], lookAt = [0, 2, 0], speed = 3 }) {
    this.mesh = mesh
    this.camera = camera
    this.offset = offset
    this.lookAt = lookAt
    this.speed = speed
    this.currentPosition = new THREE.Vector3()
    this.currentLookat = new THREE.Vector3()

    this.camera.position.copy(calc(mesh, offset))
    this.camera.lookAt(calc(mesh, lookAt))
  }

  update(delta) {
    this.currentPosition.copy(this.camera.position)
    const newLookAt = [...this.lookAt]

    const idealPosition = calc(this.mesh, this.offset)
    const idealLookAt = calc(this.mesh, newLookAt)

    const t = this.speed * delta * (input.run ? 2 : 1)
    this.currentPosition.lerp(idealPosition, t)
    this.currentLookat.lerp(idealLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
