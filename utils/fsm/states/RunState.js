import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    if (this.actions && this.action && this.actions[oldState.name]) {
      const oldAction = this.actions[oldState.name]
      this.action.enabled = true
      this.action.timeScale = 1

      if (['walk'].includes(oldState.name)) {
        const ratio = this.action.getClip().duration / oldAction.getClip().duration
        this.action.time = oldAction.time * ratio // sync legs
      } else {
        this.action.time = 0.0
        this.action.setEffectiveTimeScale(1)
        this.action.setEffectiveWeight(1)
      }

      this.action.crossFadeFrom(oldAction, .75, true)
    }

    if (!this.action) {
      this.action = this.actions.walk
      this.action.setEffectiveTimeScale(1.25)
    }
    this.action.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed * 2, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!this.keyboard.capsLock) this.fsm.setState('walk')
    if (!this.keyboard.up) this.fsm.setState('idle')
  }

  exit() {
    this.action.setEffectiveTimeScale(1)
    this.action = null
  }
}