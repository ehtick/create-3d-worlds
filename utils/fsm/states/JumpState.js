import SpecialState from './SpecialState.js'

const getSpeed = state => {
  if (state === 'walk') return 2
  if (state === 'walkBackward') return -2
  if (state === 'run') return 4
  return 0
}

export default class JumpState extends SpecialState {

  enter(oldState) {
    super.enter(oldState)
  }

  update(delta) {
    this.move(delta, -1, getSpeed(this.prevState))
  }
}