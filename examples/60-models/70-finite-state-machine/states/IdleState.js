import State from './State.js'
import keyboard from '/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class IdleState extends State {
  enter(oldState) {
    const curAction = this._actions.idle
    if (oldState) {
      const oldAction = this._actions[oldState.name]
      syncFrom(['walk', 'run', 'attack', 'special'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (keyboard.up || keyboard.down)
      this._fsm.setState('walk')

    if (keyboard.pressed.Enter)
      this._fsm.setState('attack')

    if (keyboard.pressed.Space)
      this._fsm.setState('jump')

    if (keyboard.pressed.KeyV)
      this._fsm.setState('special')
  }
};
