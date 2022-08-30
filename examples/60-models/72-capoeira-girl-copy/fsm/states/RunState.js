import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class RunState extends State {
  enter(oldState) {
    const curAction = this.actions.run
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom('walk', oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.up) {
      if (!keyboard.capsLock)
        this.fsm.setState('walk')
      return
    }
    this.fsm.setState('idle')
  }
}