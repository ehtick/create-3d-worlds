import State from './State.js'
import keyboard from '/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class RunState extends State {
  enter(oldState) {
    const curAction = this._actions.run
    if (oldState) {
      const oldAction = this._actions[oldState.name]
      syncFrom('walk', oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (keyboard.pressed.Space)
      this._fsm.setState('jump')

    if (keyboard.up || keyboard.down) {
      if (!keyboard.capsLock)
        this._fsm.setState('walk')
      return
    }
    this._fsm.setState('idle')
  }
};
