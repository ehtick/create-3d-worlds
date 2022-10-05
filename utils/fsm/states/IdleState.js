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
    }

    if (!this.action && oldAction)
      oldAction.fadeOut(duration)

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.forward(delta)

    if (this.keyboard.up || this.keyboard.down || this.joystick?.forward < 0
      || this.keyboard.sideLeft || this.keyboard.sideRight)
      this.fsm.setState('walk')

    if (this.fsm.inAir)
      this.fsm.setState('fall')

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
