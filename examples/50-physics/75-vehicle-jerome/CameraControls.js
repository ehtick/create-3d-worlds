import * as THREE from 'three'

export default class CameraControls {
  constructor(object3d) {
    this.object3d = object3d
    this.offsetCamera = new THREE.Vector3(0, 2, -6).setLength(10)
    this.lookatCamera = new THREE.Vector3(0, 0, +4)
    this.tweenOffset = 0.1
    this.tweenLookAt = 0.1
    this._currentOffset = null
    this._currentLookat = null
  }

  update(ammoVehicle) {
    const object3dVehicle = ammoVehicle.object3d.getObjectByName('chassis')

    const offsetCamera = this.offsetCamera.clone()
    object3dVehicle.localToWorld(offsetCamera)

    if (this._currentOffset === null)
      this._currentOffset = offsetCamera.clone()
	 else
      this._currentOffset.multiplyScalar(1 - this.tweenOffset)
        .add(offsetCamera.clone().multiplyScalar(this.tweenOffset))

    this.object3d.position.copy(this._currentOffset)

    const lookatCamera = this.lookatCamera.clone()
    object3dVehicle.localToWorld(lookatCamera)
    if (this._currentLookat === null)
      this._currentLookat = lookatCamera.clone()
	 else
      this._currentLookat.multiplyScalar(1 - this.tweenLookAt)
        .add(lookatCamera.clone().multiplyScalar(this.tweenLookAt))

    this.object3d.lookAt(this._currentLookat)
  }
}
