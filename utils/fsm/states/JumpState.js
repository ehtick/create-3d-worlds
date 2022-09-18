import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.speed = oldState.speed
  }

  update(delta) {
    this.move(delta)
  }

  exit() {
    this.speed *= .75
  }
}