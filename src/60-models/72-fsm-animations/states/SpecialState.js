import * as THREE from '/node_modules/three127/build/three.module.js'
import State from './State.js'

const duration = .25

export default class SpecialState extends State {
  constructor(...args) {
    super(...args)
    this._FinishedCallback = this._FinishedCallback.bind(this)
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
      curAction.crossFadeFrom(oldAction, duration, true)
    }
    curAction.play()
  }

  _Cleanup() {
    this._actions[this.name].getMixer().removeEventListener('finished', this._FinishedCallback)
  }

  _FinishedCallback() {
    this._Cleanup()
    this._fsm.setState('idle')
  }

  exit() {
    this._Cleanup()
  }
};