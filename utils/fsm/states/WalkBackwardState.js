import State from './State.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const backwardSpeed = -2

export default class WalkBackwardState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    const oldAction = this.actions[oldState.name]
    if (this.actions && this.action && this.actions[oldState?.name])
      syncAnimation(['idle'], oldState, oldAction, this.action)
    else
      oldAction?.fadeOut(.5)

    this.action?.reset()
    this.action?.play()
    this.action.timeScale = -1
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, backwardSpeed, this.t)

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
