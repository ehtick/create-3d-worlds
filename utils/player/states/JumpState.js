import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    if (this.keyboard.down) this.reverseAction()
  }

  update(delta) {
    this.player.move(delta)
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }
}