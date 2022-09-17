import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.oldSpeed = oldState.speed

    this.action.timeScale = 1

    if (['walk'].includes(oldState.name))
      this.syncLegs()
    else
      this.prepareAction()

    this.action.crossFadeFrom(oldAction, .75, true)

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