import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class IdleState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    this.action.setEffectiveTimeScale(1)

    const duration = oldState?.name === 'jump' ? .25 : .75
    if (oldAction) this.action.crossFadeFrom(oldAction, duration)

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.up)
      this.fsm.setState('walk')

    if (this.keyboard.down)
      this.fsm.setState('walkBackward')

    if (this.keyboard.space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.control)
      this.fsm.setState('special')

    if (this.keyboard.backspace)
      this.fsm.setState('pain')

    if (this.keyboard.pressed.Delete)
      this.fsm.setState('death')
  }
}
