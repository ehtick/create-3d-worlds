import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class IdleState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.oldSpeed = oldState?.speed || 0

    let oldAction = this.actions[oldState?.name]
    if (!oldAction && oldState?.name === 'run') oldAction = this.actions?.walk

    if (this.actions && oldAction && this.action) {
      const syncFrom = ['walk', 'run', 'walkBackward']
      this.action.enabled = true
      this.action.timeScale = 1
      if (syncFrom.includes(oldState.name)) {
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
