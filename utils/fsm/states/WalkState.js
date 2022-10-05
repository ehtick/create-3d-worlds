import * as THREE from 'three'
import State from './State.js'
import { mapRange } from '/utils/helpers.js'

const { lerp } = THREE.MathUtils

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .75
}

export default class WalkState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)

    const sign = this.keyboard.down ? -1 : 1
    const timeScale = this.joystick?.forward ? mapRange(-this.joystick.forward, 0, .75, .75, 1.25) : sign
    this.action?.setEffectiveTimeScale(timeScale)

    if (this.prevState !== 'run' || this.actions.run) {
      if (this.prevState === 'run') this.syncTime()

      const duration = chooseDuration(oldState.name)
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      else if (oldAction) oldAction.fadeOut(duration)
    }

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    if (this.keyboard.up) this.speed = lerp(this.oldSpeed, this.fsm.speed, this.t)
    if (this.keyboard.down) this.speed = lerp(this.oldSpeed, -this.fsm.speed, this.t)

    const jumpStep = Math.abs(this.speed) * delta * 1.5
    this.fsm.normalizeGround(jumpStep)

    this.turn(delta)
    this.forward(delta)
    this.strafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.fsm.setState('jump')

    if (this.fsm.inAir)
      this.fsm.setState('fall')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.capsLock || this.joystick?.forward < -.75)
      this.fsm.setState('run')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      this.fsm.setState('idle')
  }
}