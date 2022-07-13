import * as THREE from '/node_modules/three127/build/three.module.js'
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