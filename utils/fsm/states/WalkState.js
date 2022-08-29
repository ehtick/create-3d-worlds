import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class WalkState extends State {
  enter(oldState) {
    const curAction = this.actions.walk
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this.fsm.setState('bencao')

    if (keyboard.up) {
      if (keyboard.capsLock)
        this.fsm.setState('run')
      return
    }

    this.fsm.setState('idle')
  }
}