import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class WalkBackwardState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    const oldAction = this.actions[oldState.name]
    if (this.actions && this.action && this.actions[oldState?.name]) {
      this.action.enabled = true
      this.action.timeScale = 1

      if (['idle'].includes(oldState.name)) {
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
    this.action.timeScale = -1
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, -this.fsm.speed, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!this.keyboard.down) this.fsm.setState('idle')
  }

  exit() {
    this.action.timeScale = 1
  }
}
