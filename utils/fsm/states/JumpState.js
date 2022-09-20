import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    if (oldState.name === 'walkBackward') this.action.setEffectiveTimeScale(-1)
    super.enter(oldState, oldAction)
    this.speed = oldState.speed
  }

  update(delta) {
    this.forward(delta)
  }

  exit() {
    this.speed *= .75
    this.action.setEffectiveTimeScale(1)
  }
}