import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const backwardSpeed = -2

export default class WalkBackwardState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed
    const oldAction = this.actions[oldState.name]
    syncAnimation(['idle'], oldState, oldAction, this.action)
    this.action.play()
    this.action.timeScale = -1
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, backwardSpeed, this.t)

    this.turn(delta, 1)
    this.move(delta)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!keyboard.down) this.fsm.setState('idle')
  }
}
