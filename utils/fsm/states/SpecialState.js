import * as THREE from 'three'
import State from './State.js'

const duration = .25

export default class SpecialState extends State {
  constructor(...args) {
    super(...args)
    this.prevState = ''
    this._FinishedCallback = this._FinishedCallback.bind(this)
  }

  enter(oldState) {
    this.prevState = oldState.name
    const curAction = this.actions[this.name]
    const mixer = curAction.getMixer()
    mixer.addEventListener('finished', this._FinishedCallback)

    if (oldState) {
      const oldAction = this.actions[oldState.name]
      curAction.reset()
      curAction.setLoop(THREE.LoopOnce, 1)
      curAction.clampWhenFinished = true
      curAction.crossFadeFrom(oldAction, duration, true)
    }
    curAction.play()
  }

  _Cleanup() {
    this.actions[this.name].getMixer().removeEventListener('finished', this._FinishedCallback)
  }

  _FinishedCallback() {
    this._Cleanup()
    // skok se vraća u prethodno stanje
    // ako nije pritisnuto ništa treba u idle
    this.fsm.setState(this.prevState || 'idle')
  }

  exit() {
    this._Cleanup()
  }
}