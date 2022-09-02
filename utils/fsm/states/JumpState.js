import SpecialState from './SpecialState.js'

let speed = 0

export default class JumpState extends SpecialState {

  enter(oldState) {
    super.enter(oldState)
    speed = 0
    if (oldState.name === 'walk') speed = 2
    if (oldState.name === 'run') speed = 4
  }

  update(delta) {
    this.move(delta, -1, speed)
  }
}