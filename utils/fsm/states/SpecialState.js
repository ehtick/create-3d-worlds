import * as THREE from 'three'
import State from './State.js'

const duration = .25

export default class SpecialState extends State {
  constructor(...args) {
    super(...args)
    this.prevState = ''
    this.speed = 0
    this._FinishedCallback = this._FinishedCallback.bind(this)
  }

  enter(oldState) {
    this.prevState = oldState.name
    const mixer = this.action.getMixer()
    mixer.addEventListener('finished', this._FinishedCallback)

    const oldAction = this.actions[oldState.name]
    this.action.reset()
    this.action.setLoop(THREE.LoopOnce, 1)
    this.action.clampWhenFinished = true
    this.action.crossFadeFrom(oldAction, duration, true)
    this.action.play()
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