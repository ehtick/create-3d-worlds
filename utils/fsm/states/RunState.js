import * as THREE from 'three'
import { mapRange } from '/utils/helpers.js'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class RunState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    const duration = oldState?.name === 'jump' ? .15 : .75
    const sign = this.keyboard.down ? -1 : 1

    if (this.actions.run) {
      if (this.prevState === 'walk') this.syncTime()
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      const timeScale = this.joystick?.forward
        ? mapRange(-this.joystick.forward, .75, 1, .75, 1.25)
        : sign
      this.action.setEffectiveTimeScale(timeScale)
    }

    if (!this.actions.run) {
      this.action = this.actions.walk
      if (this.action && oldAction && oldState?.name !== 'walk') this.action.crossFadeFrom(oldAction, duration)
      const timeScale = this.joystick?.forward
        ? mapRange(-this.joystick.forward, .75, 1, 1.25, 1.75)
        : 1.5 * sign
      this.action?.setEffectiveTimeScale(timeScale)
    }

    this.action?.play()
    if (this.action) this.action.enabled = true
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed * 2, this.t)

    const jumpStep = this.speed * delta * 1.5
    this.fsm.normalizeGround(jumpStep)

    this.turn(delta)

    if (this.keyboard.up)
      this.forward(delta)

    if (this.keyboard.down)
      this.backward(delta)

    this.strafe(delta)

    /* TRANSIT */

    if (this.keyboard.space)
      this.fsm.setState('jump')

    if (this.fsm.inAir)
      this.fsm.setState('fall')

    if (!this.keyboard.capsLock && !(this.joystick?.forward < -.75))
      this.fsm.setState('walk')

    if (!this.keyboard.up && !this.keyboard.down && !this.joystick?.forward
      && !this.keyboard.sideLeft && !this.keyboard.sideRight)
      this.fsm.setState('idle')
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}