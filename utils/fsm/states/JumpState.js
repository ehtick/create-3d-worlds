import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.speed = oldState.speed
    if (oldState.name === 'walkBackward') this.reverseAction()
  }

  update(delta) {
    this.forward(delta, this.prevState === 'walkBackward' ? 1 : -1)
  }

  exit() {
    this.speed *= .75
    this.action.setEffectiveTimeScale(1)
  }
}