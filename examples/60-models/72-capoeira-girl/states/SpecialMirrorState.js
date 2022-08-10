import * as THREE from 'three'
import SpecialState from './SpecialState.js'

export default class SpecialMirrorState extends SpecialState {
  enter(oldState) {
    super.enter(oldState)
    this._fsm._mesh.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
  }

  _FinishedCallback = () => {
    super._FinishedCallback()
    this._fsm._mesh.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
  }
}