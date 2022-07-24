import * as THREE from '/node_modules/three127/build/three.module.js'
import { entity } from './entity.js'
import { camera } from '/utils/scene.js'

export class ThirdPersonCamera extends entity.Component {
  constructor({ target }) {
    super()
    this._target = target
    this._currentPosition = new THREE.Vector3()
    this._currentLookat = new THREE.Vector3()
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-0, 10, -15)
    idealOffset.applyQuaternion(this._target._rotation)
    idealOffset.add(this._target._position)

    const terrain = this.FindEntity('terrain').GetComponent('TerrainChunkManager')
    idealOffset.y = Math.max(idealOffset.y, terrain.GetHeight(idealOffset)[0] + 5.0)

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

    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, timeElapsed)

    this._currentPosition.lerp(idealOffset, t)
    this._currentLookat.lerp(idealLookat, t)

    camera.position.copy(this._currentPosition)
    camera.lookAt(this._currentLookat)
  }
}
