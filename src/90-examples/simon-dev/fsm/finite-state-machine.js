export class FiniteStateMachine {
  constructor() {
    this._states = {}
    this.currentState = null
  }

  _AddState(name, type) {
    this._states[name] = type
  }

  SetState(name) {
    const prevState = this.currentState

    if (prevState) {
      if (prevState.Name == name)
        return

      prevState.Exit()
    }

    const state = new this._states[name](this)
    this.currentState = state
    state.Enter(prevState)
  }

  Update(timeElapsed, keys) {
    if (this.currentState)
      this.currentState.Update(timeElapsed, keys)
  }
};
