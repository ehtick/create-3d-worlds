/* credit to simon dev */
import * as THREE from 'three'
import input from '/utils/classes/Input.js'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

const speedFactor = state => {
  if (state == 'jump' || state == 'fall') return 2
  if (state == 'run') return 1.5
  return 1
}

export default class ThirdPersonCamera {
  constructor({ camera, mesh, height = 2, speed = 2,
    offset = [0, height * .75, height * 1.75],
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

    // this.camera.near = .5
    // this.camera.updateProjectionMatrix()
  }

  updatePosition() {
    this.camera.position.copy(calc(this.mesh, this.offset))
  }

  update(delta, stateName) {
    this.currentPosition.copy(this.camera.position)

    const idealPosition = calc(this.mesh, this.offset)
    const idealLookAt = calc(this.mesh, this.lookAt)

    const t = this.speed * delta * speedFactor(stateName)
    this.currentPosition.lerp(idealPosition, t)
    this.currentLookat.lerp(idealLookAt, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
