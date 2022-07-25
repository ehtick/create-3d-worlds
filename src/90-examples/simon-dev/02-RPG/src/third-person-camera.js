import * as THREE from '/node_modules/three127/build/three.module.js'

import { Component } from '../../ecs/component.js'

export default class ThirdPersonCamera extends Component {
  constructor({ camera, target }) {
    super()

    this._target = target
    this._camera = camera

    this._currentPosition = new THREE.Vector3()
    this._currentLookat = new THREE.Vector3()
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15)
    idealOffset.applyQuaternion(this._target._rotation)
    idealOffset.add(this._target._position)
    return idealOffset
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 5, 20)
    idealLookat.applyQuaternion(this._target._rotation)
    idealLookat.add(this._target._position)
    return idealLookat
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset()
    const idealLookat = this._CalculateIdealLookat()

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, timeElapsed)

    this._currentPosition.lerp(idealOffset, t)
    this._currentLookat.lerp(idealLookat, t)

    this._camera.position.copy(this._currentPosition)
    this._camera.lookAt(this._currentLookat)
  }
}
