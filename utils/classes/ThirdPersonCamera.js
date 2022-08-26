/* credit to simon dev */
import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

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
    const speed = keyboard.keyPressed ? this.speed : this.speed * 3
    const t = speed * delta

    this.currentPosition.lerp(calc(this.mesh, this.offset), t)
    this.currentLookat.lerp(calc(this.mesh, this.lookAt), t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookat)
  }
}
