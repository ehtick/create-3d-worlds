export default class State {
  constructor(fsm, name) {
    this._fsm = fsm
    this._actions = fsm._actions
    this._name = name
  }

  get name() {
    return this._name
  }

  enter() {}

  exit() {}

  update() {}
};
