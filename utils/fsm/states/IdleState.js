import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

const { pressed } = keyboard

export default class IdleState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.speed = 2
    const curAction = this.actions.idle
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['walk', 'run', 'walkBackward'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update(delta) {
    this.turn(delta)
    if (this.prevState === 'walk')
      this.move(delta, -1, Math.max(this.speed -= .05, 0))

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

    if (this.fsm.animKeys)
      for (const key in this.fsm.animKeys)
        if (pressed[key]) this.fsm.setState(this.fsm.animKeys[key])
  }
}
