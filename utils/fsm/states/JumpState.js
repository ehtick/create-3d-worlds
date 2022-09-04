import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState) {
    super.enter(oldState)
  }

  update(delta) {
    this.move(delta)
  }
}