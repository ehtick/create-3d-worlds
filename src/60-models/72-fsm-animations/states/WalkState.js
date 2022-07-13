import State from './State.js'
import keyboard from '/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class WalkState extends State {
  enter(oldState) {
    const curAction = this._actions.walk
    if (oldState) {
      const oldAction = this._actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (keyboard.pressed.Space)
      this._fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this._fsm.setState('bencao')

    if (keyboard.up) {
      if (keyboard.capsLock)
        this._fsm.setState('run')
      return
    }

    this._fsm.setState('idle')
  }
};
