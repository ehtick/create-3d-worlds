import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    if (this.keyboard.down) this.reverseAction()
  }

  update(delta) {
    this.forward(delta, this.keyboard.down ? 1 : -1)
  }

  exit() {
    this.speed *= .75
    this.action?.setEffectiveTimeScale(1)
  }
}