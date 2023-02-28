import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)

    if (this.player.input.down) this.reverseAction()
  }

  update(delta) {
    this.player.updateMove(delta)
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}