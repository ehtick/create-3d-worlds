import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class WalkBackwardState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)

    if (oldAction) this.action.crossFadeFrom(oldAction, .75, true)
    this.action?.play()
    this.action.setEffectiveTimeScale(-1)
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, -this.fsm.speed, this.t)

    this.turn(delta)
    this.forward(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!this.keyboard.down)
      this.fsm.setState('idle')
  }

  exit() {
    this.action.setEffectiveTimeScale(1)
  }
}
