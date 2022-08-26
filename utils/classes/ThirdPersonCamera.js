/* credit to simon dev */
import * as THREE from 'three'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

export default class ThirdPersonCamera {
  constructor({ camera, mesh, offset = [0, 1, 1.5], lookAt = [0, 1, 0], speed = 4 }) {
    this.mesh = mesh
    this.camera = camera
    this.offset = offset
    this.lookAt = lookAt
    this.speed = speed
    this.currentPosition = new THREE.Vector3()
    this.currentLookat = new THREE.Vector3()
  }

  update(delta) {
    const newPosition = calc(this.mesh, this.offset)
    const newLookAt = calc(this.mesh, this.lookAt)

    const heightDiff = newPosition.y - this.currentPosition.y

    const speed = this.speed * (1 + Math.abs(heightDiff) * 3)
    const t = speed * delta

    this.currentPosition.lerp(newPosition, t)
    this.currentLookat.lerp(newLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
