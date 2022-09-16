import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class WalkBackwardState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    const oldAction = this.actions[oldState.name]
    if (this.actions && this.action && this.actions[oldState?.name]) {
      this.actions.enabled = true
      this.actions.timeScale = 1

      if (['idle'].includes(oldState.name)) {
        const ratio = this.actions.getClip().duration / oldAction.getClip().duration
        this.actions.time = oldAction.time * ratio // sync legs
      } else {
        this.actions.time = 0.0
        this.actions.setEffectiveTimeScale(1)
        this.actions.setEffectiveWeight(1)
      }
      this.actions.crossFadeFrom(oldAction, .75, true)
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
