/* credit to simon dev */
import * as THREE from 'three'
import input from '/utils/classes/Input.js'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

export default class ThirdPersonCamera {
  constructor({ camera, mesh, height = 2, speed = 3,
    offset = [.5, height * .75, 3.5],
    lookAt = [0, height * .75, 0],
  }) {
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

  updatePosition() {
    this.camera.position.copy(calc(this.mesh, this.offset))
  }

  update(delta) {
    this.currentPosition.copy(this.camera.position)

    const idealPosition = calc(this.mesh, this.offset)
    const idealLookAt = calc(this.mesh, this.lookAt)

    const t = this.speed * delta * (input.run ? 2 : 1)
    this.currentPosition.lerp(idealPosition, t)
    this.currentLookat.lerp(idealLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
