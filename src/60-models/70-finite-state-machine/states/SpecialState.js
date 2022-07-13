import * as THREE from '/node_modules/three127/build/three.module.js'
import State from './State.js'

export default class SpecialState extends State {
  constructor(...args) {
    super(...args)
    this._FinishedCallback = () => {
      this._Cleanup()
      this._fsm.setState('idle')
    }
  }

  enter(oldState) {
    const curAction = this._actions[this.name]
    const mixer = curAction.getMixer()
    mixer.addEventListener('finished', this._FinishedCallback)

    if (oldState) {
      const oldAction = this._actions[oldState.name]
      curAction.reset()
      curAction.setLoop(THREE.LoopOnce, 1)
      curAction.clampWhenFinished = true
      curAction.crossFadeFrom(oldAction, 0.2, true)
    }
    curAction.play()
  }

  _Cleanup() {
    this._actions[this.name].getMixer().removeEventListener('finished', this._FinishedCallback)
  }

  exit() {
    this._Cleanup()
  }
};