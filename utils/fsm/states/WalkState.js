import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class WalkState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    const oldAction = this.actions[oldState.name]
    if (this.actions && this.action && this.actions[oldState?.name]) {
      this.action.enabled = true
      this.action.timeScale = 1

      if (['idle', 'run'].includes(oldState.name)) {
        const ratio = this.action.getClip().duration / oldAction.getClip().duration
        this.action.time = oldAction.time * ratio // sync legs
      } else {
        this.action.time = 0.0
        this.action.setEffectiveTimeScale(1)
        this.action.setEffectiveWeight(1)
      }

      this.action.crossFadeFrom(oldAction, .75, true)
    } else
      oldAction?.fadeOut(.5)

    this.action?.reset()
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

    if (!this.keyboard.up) this.fsm.setState('idle')
  }
}