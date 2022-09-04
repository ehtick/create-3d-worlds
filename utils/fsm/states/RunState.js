import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const runSpeed = 4

export default class RunState extends State {
  enter(oldState) {
    if (oldState) {
      this.oldSpeed = oldState.speed
      const oldAction = this.actions[oldState.name]
      syncAnimation('walk', oldState, oldAction, this.action)
    }
    this.action.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, runSpeed, this.t)

    this.turn(delta)
    this.move(delta)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!keyboard.capsLock) this.fsm.setState('walk')
    if (!keyboard.up) this.fsm.setState('idle')
  }
}