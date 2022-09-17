import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)

    if (!this.actions.run)
      this.action.setEffectiveTimeScale(1.5)
    else if (oldState.name === 'walk') {
      this.action.setEffectiveTimeScale(1)
      this.syncLegs()
      this.action.crossFadeFrom(oldAction, .75, true)
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

    if (!this.keyboard.capsLock)
      this.fsm.setState('walk')

    if (!this.keyboard.up)
      this.finishThenIdle()
  }

  exit() {
    this.action.setEffectiveTimeScale(1)
    // this.action = null
  }
}