import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

const chooseDuration = prevState => {
  if (prevState === 'jump') return .25
  return .75
}

export default class IdleState extends State {

  enter(oldState, oldAction) {
    super.enter(oldState)
    this.action?.setEffectiveTimeScale(1)

    const duration = chooseDuration(oldState?.name)

    if (this.action && oldAction) {
      if (this.prevState === 'walk' || this.prevState === 'run') this.syncTime()
      this.action.crossFadeFrom(oldAction, duration)
    } else if (oldAction)
      oldAction.fadeOut(duration)

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    const oldSpeed = this.prevState === 'walkBackward' ? -this.oldSpeed : this.oldSpeed
    this.speed = lerp(oldSpeed * .5, 0, this.t)

    this.turn(delta)
    this.forward(delta)

    if (this.keyboard.up || this.joystick?.forward < 0)
      this.fsm.setState('walk')

    if (this.keyboard.down || this.joystick?.forward > 0)
      this.fsm.setState('walkBackward')

    if (this.keyboard.jump)
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
