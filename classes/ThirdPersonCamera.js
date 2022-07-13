import * as THREE from '/node_modules/three127/build/three.module.js'

const calc = (mesh, pos) => new THREE.Vector3(...pos)
  .applyQuaternion(mesh.quaternion)
  .add(mesh.position)

// credit to simon dev
export default class ThirdPersonCamera {
  constructor({ camera, mesh }) { // with position and rotation
    this._mesh = mesh
    this._camera = camera
    this._currentPosition = new THREE.Vector3()
    this._currentLookat = new THREE.Vector3()
  }

  update(delta) {
    const idealOffset = calc(this._mesh, [-5, 15, -20])
    const idealLookat = calc(this._mesh, [0, 10, 50])

    // const t = 0.05;        // naive
    // const t = 4.0 * delta; // better
    const t = 1.0 - Math.pow(0.001, delta) // best

    this._currentPosition.lerp(idealOffset, t)
    this._currentLookat.lerp(idealLookat, t)

    this._camera.position.copy(this._currentPosition)
    this._camera.lookAt(this._currentLookat)
  }
}
