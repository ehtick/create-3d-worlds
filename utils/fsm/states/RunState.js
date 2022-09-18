import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = oldState?.name === 'jump' ? .15 : .75

    if (this.actions.run) {
      this.action.setEffectiveTimeScale(1)
      if (oldAction) this.action.crossFadeFrom(oldAction, duration)
      this.action.play()
    } else {
      this.action = this.fsm.actions.walk
      if (oldState?.name !== 'walk') this.action.crossFadeFrom(oldAction, duration)
      this.actions.walk.play()
      this.action.setEffectiveTimeScale(1.5)
    }
    // this.action.enabled = true
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed * 2, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!this.keyboard.capsLock)
      this.fsm.setState('walk')

    if (!this.keyboard.up)
      this.finishThenIdle()
  }

  exit() {
    // this.action.setEffectiveTimeScale(1)
  }
}