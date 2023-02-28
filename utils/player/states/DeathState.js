import SpecialState from './SpecialState.js'

export default class DeathState extends SpecialState {

  enter(oldState, oldAction) {
    const active = this.player.mixer._actions.filter(action => action.isRunning())
    if (active.length > 1)
      this.player.mixer.stopAllAction()
    super.enter(oldState, oldAction)
  }

  _FinishedCallback() {
    this._Cleanup()
  }
}