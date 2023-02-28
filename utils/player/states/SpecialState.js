import * as THREE from 'three'
import State from './State.js'

const duration = .25

export default class SpecialState extends State {
  constructor(...args) {
    super(...args)
    this.prevState = ''
    this.onFinish = this.onFinish.bind(this)
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (!this.action) return this.player.setState(this.previousOrIdle)

    this.oldState = oldState
    const { mixer } = this.player
    mixer.addEventListener('finished', this.onFinish)
    this.action.reset()
    this.action.setLoop(THREE.LoopOnce, 1)
    this.action.clampWhenFinished = true
    if (oldAction) this.action.crossFadeFrom(oldAction, duration)

    this.action.play()
  }

  cleanup() {
    this.action?.getMixer().removeEventListener('finished', this.onFinish)
  }

  onFinish() {
    this.cleanup()

    this.player.setState(this.previousOrIdle)
  }

  exit() {
    this.cleanup()
  }
}