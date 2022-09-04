import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class WalkBackwardState extends State {
  enter(oldState) {
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle'], oldState, oldAction, this.action)
    }
    this.action.play()
    this.action.timeScale = -1
  }

  update(delta) {
    this.turn(delta, 1)
    this.move(delta, 1)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!keyboard.down) this.fsm.setState('idle')
  }
}
