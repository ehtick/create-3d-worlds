import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = oldState?.name === 'jump' ? .15 : .75

    if (this.actions.run) {
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      this.action.setEffectiveTimeScale(1)
    } else {
      this.action = this.actions.walk
      if (this.action && oldAction && oldState?.name !== 'walk') this.action.crossFadeFrom(oldAction, duration)
      this.action?.setEffectiveTimeScale(1.5)
    }
    this.action?.play()
    if (this.action) this.action.enabled = true
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed * 2, this.t)

    this.turn(delta)
    this.forward(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!this.keyboard.capsLock)
      this.fsm.setState('walk')

    if (!this.keyboard.up)
      this.fsm.setState('idle')
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}