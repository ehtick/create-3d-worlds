import SpecialState from './SpecialState.js'

let speed = 0

const getSpeed = state => {
  if (state === 'walk') return 2
  if (state === 'walkBackward') return -2
  if (state === 'run') return 4
  return 0
}

export default class JumpState extends SpecialState {

  enter(oldState) {
    super.enter(oldState)
    speed = getSpeed(oldState.name)
  }

  update(delta) {
    this.move(delta, -1, speed)
  }
}