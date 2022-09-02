import SpecialState from './SpecialState.js'

let speed = 2

export default class JumpState extends SpecialState {

  enter(oldState) {
    super.enter(oldState)
    speed = (oldState.name === 'run') ? 4 : 2
  }

  update(delta) {
    this.move(delta, -1, speed)
  }
}