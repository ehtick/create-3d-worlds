import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'

export default class IdleState extends State {
  enter(oldState) {
    super.enter(oldState)

    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncAnimation(['walk', 'run', 'walkBackward'], oldState, oldAction, this.action)
    }
    this.action.play()
  }

  update(delta) {
    this.turn(delta)
    if (this.prevState === 'walk' || this.prevState === 'run' || this.prevState === 'walkBackward') {
      this.speed = Math.max(this.speed - .05, 0)
      this.move(delta, this.prevState === 'walkBackward' ? 1 : -1)
    }

    if (keyboard.up && this.actions.walk)
      this.fsm.setState('walk')

    if (keyboard.down && this.actions.walkBackward)
      this.fsm.setState('walkBackward')

    if (keyboard.pressed.Space && this.actions.jump)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter && this.actions.attack)
      this.fsm.setState('attack')

    if (keyboard.pressed.ControlLeft && this.actions.special)
      this.fsm.setState('special')
  }
}
