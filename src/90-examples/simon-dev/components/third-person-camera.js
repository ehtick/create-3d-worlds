import * as THREE from 'three'
import { Component } from '../ecs/component.js'
import { camera } from '/utils/scene.js'

export class ThirdPersonCamera extends Component {
  constructor({ target }) {
    super()
    this.target = target
    this._currentPosition = new THREE.Vector3()
    this._currentLookat = new THREE.Vector3()
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15)
    idealOffset.applyQuaternion(this.target._rotation)
    idealOffset.add(this.target.position)

    if (this.FindEntity('terrain')) {
      const terrain = this.FindEntity('terrain').GetComponent('TerrainChunkManager')
      idealOffset.y = Math.max(idealOffset.y, terrain.GetHeight(idealOffset)[0] + 5.0)
    }
    return idealOffset
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 5, 20)
    idealLookat.applyQuaternion(this.target._rotation)
    idealLookat.add(this.target.position)
    return idealLookat
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset()
    const idealLookat = this._CalculateIdealLookat()

    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, timeElapsed)

    this._currentPosition.lerp(idealOffset, t)
    this._currentLookat.lerp(idealLookat, t)

    camera.position.copy(this._currentPosition)
    camera.lookAt(this._currentLookat)
  }
}
