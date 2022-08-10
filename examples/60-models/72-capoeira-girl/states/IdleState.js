import State from './State.js'
import keyboard from '/classes/Keyboard.js'
import { syncFrom } from './utils.js'
import { kachujinMoves } from '/data/animations.js'

const { pressed } = keyboard

export default class IdleState extends State {
  enter(oldState) {
    const curAction = this._actions.idle
    if (oldState) {
      const oldAction = this._actions[oldState.name]
      syncFrom(['walk', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update() {
    if (pressed.KeyW)
      this._fsm.setState('walk')

    if (pressed.KeyS)
      this._fsm.setState('walk backward')

    for (const key in kachujinMoves)
      if (pressed[key]) this._fsm.setState(kachujinMoves[key])
  }
};
