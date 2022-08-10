import IdleState from './states/IdleState.js'
import WalkState from './states/WalkState.js'
import RunState from './states/RunState.js'
import SpecialState from './states/SpecialState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  special: SpecialState,
  jump: SpecialState,
  attack: SpecialState,
}

export default class StateMachine {
  constructor(actions) {
    this._actions = actions
    this.setState('idle')
  }

  setState(name) {
    const oldState = this._currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    this._currentState = new states[name](this, name)
    this._currentState.enter(oldState)
  }

  update() {
    this._currentState.update()
  }
};
