import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .75
}

export default class WalkBackwardState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)

    const duration = chooseDuration(oldState.name)
    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
    this.action?.play()
    this.action?.setEffectiveTimeScale(-1)
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed, this.t)

    this.turn(delta)
    this.forward(delta, 1)

    if (this.fsm.inAir)
      this.fsm.setState('fall')

    if (this.keyboard.jump)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!this.keyboard.down && !this.joystick?.forward)
      this.fsm.setState('idle')
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}
