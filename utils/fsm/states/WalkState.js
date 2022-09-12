import State from './State.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const walkSpeed = 2

export default class WalkState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    const oldAction = this.actions[oldState.name]
    if (this.actions && this.action && this.actions[oldState?.name])
      syncAnimation(['idle', 'run'], oldState, oldAction, this.action)
    else
      oldAction?.fadeOut(.5)

    this.action?.reset()
    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, walkSpeed, this.t)

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