import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'

export default class RunState extends State {
  enter(oldState) {
    this.speed = 4
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncAnimation('walk', oldState, oldAction, this.action)
    }
    this.action.play()
  }

  update(delta) {
    this.turn(delta)
    this.move(delta)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!keyboard.capsLock) this.fsm.setState('walk')
    if (!keyboard.up) this.fsm.setState('idle')
  }
}