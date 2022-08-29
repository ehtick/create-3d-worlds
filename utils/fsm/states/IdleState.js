import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

const { pressed } = keyboard

export default class IdleState extends State {
  enter(oldState) {
    const curAction = this._actions.idle
    if (oldState) {
      const oldAction = this._actions[oldState.name]
      syncFrom(['walk', 'run', 'walkBackward'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    // mozda keyboard.up
    if (pressed.KeyW)
      this._fsm.setState('walk')

    // mozda keyboard.down
    if (pressed.KeyS)
      this._fsm.setState('walkBackward')

    if (keyboard.pressed.Space)
      this._fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this._fsm.setState('attack')

    if (this._fsm.animKeys)
      for (const key in this._fsm.animKeys)
        if (pressed[key]) this._fsm.setState(this._fsm.animKeys[key])
  }
}
