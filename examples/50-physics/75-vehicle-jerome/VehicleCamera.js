import * as THREE from 'three'

export default class VehicleCamera {
  constructor({
    camera,
    offsetCamera = new THREE.Vector3(0, 2, -6).setLength(10),
    lookatCamera = new THREE.Vector3(0, 0, 4),
    tweenOffset = 0.1,
    tweenLookAt = 0.1
  } = {}) {
    this.camera = camera
    this.offsetCamera = offsetCamera
    this.lookatCamera = lookatCamera
    this.tweenOffset = tweenOffset
    this.tweenLookAt = tweenLookAt
    this._currentOffset = null
    this._currentLookat = null
  }

  update(ammoVehicle) {
    const object3dVehicle = ammoVehicle.mesh.getObjectByName('chassis')

    const offsetCamera = this.offsetCamera.clone()
    object3dVehicle.localToWorld(offsetCamera)

    if (this._currentOffset === null)
      this._currentOffset = offsetCamera.clone()
    else
      this._currentOffset.multiplyScalar(1 - this.tweenOffset)
        .add(offsetCamera.clone().multiplyScalar(this.tweenOffset))

    this.camera.position.copy(this._currentOffset)

    const lookatCamera = this.lookatCamera.clone()
    object3dVehicle.localToWorld(lookatCamera)

    if (this._currentLookat === null)
      this._currentLookat = lookatCamera.clone()
    else
      this._currentLookat.multiplyScalar(1 - this.tweenLookAt)
        .add(lookatCamera.clone().multiplyScalar(this.tweenLookAt))

    this.camera.lookAt(this._currentLookat)
  }
}
