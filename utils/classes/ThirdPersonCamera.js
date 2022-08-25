// credit to simon dev
import * as THREE from 'three'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

export default class ThirdPersonCamera {
  constructor({ camera, mesh, offset = [0, 1, 1.5], lookAt = [0, 1, 0] }) {
    this.mesh = mesh
    this.camera = camera
    this.offset = offset
    this.lookAt = lookAt
    this.currentPosition = new THREE.Vector3()
    this.currentLookat = new THREE.Vector3()
  }

  update(delta) {
    const idealOffset = calc(this.mesh, this.offset)
    const idealLookat = calc(this.mesh, this.lookAt)

    // const t = 4.0 * delta
    const t = 1.0 - Math.pow(0.001, delta)

    this.currentPosition.lerp(idealOffset, t)
    this.currentLookat.lerp(idealLookat, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
