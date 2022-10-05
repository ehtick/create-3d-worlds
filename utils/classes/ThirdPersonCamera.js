/* credit to simon dev */
import * as THREE from 'three'

let oldY = 0

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
    const newOffset = this.offset
    console.log(this.mesh.position.y)

    const idealPosition = calc(this.mesh, newOffset)
    const idealLookAt = calc(this.mesh, this.lookAt)

    const t = this.speed * delta
    this.currentPosition.lerp(idealPosition, t)
    this.currentLookat.lerp(idealLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
