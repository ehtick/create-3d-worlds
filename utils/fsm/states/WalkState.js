import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class WalkState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.oldSpeed = oldState.speed
    const oldAction = this.actions[oldState.name]

    this.action.enabled = true
    this.action.timeScale = 1

    if (['run'].includes(oldState.name))
      this.syncLegs()
    else
      this.prepareAction()

    if (oldAction) this.action.crossFadeFrom(oldAction, 1.75, true)
    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.capsLock)
      this.fsm.setState('run')

    if (!this.keyboard.up)
      this.finishThenIdle()
  }
}