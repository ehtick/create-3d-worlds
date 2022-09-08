import State from './State.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const walkSpeed = 2

export default class WalkState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    if (this.actions && this.action && this.actions[oldState?.name]) {
      const oldAction = this.actions[oldState.name]
      syncAnimation(['idle', 'run'], oldState, oldAction, this.action)
    }
    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, walkSpeed, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.fsm.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.fsm.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.fsm.keyboard.capsLock)
      this.fsm.setState('run')

    if (!this.fsm.keyboard.up) this.fsm.setState('idle')
  }
}