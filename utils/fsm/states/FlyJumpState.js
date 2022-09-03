import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

const getSpeed = state => {
  if (state === 'walk') return 2
  if (state === 'walkBackward') return -2
  if (state === 'run') return 4
  return 0
}

export default class FlyJumpState extends State {
  enter(oldState) {
    super.enter(oldState)
    const curAction = this.actions.jump
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update(delta) {
    this.move(delta, -1, getSpeed(this.prevState))

    if (!keyboard.pressed.Space)
      this.fsm.setState(this.prevState || 'idle')
  }
}