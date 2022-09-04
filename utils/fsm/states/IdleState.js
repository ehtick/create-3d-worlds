import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

export default class IdleState extends State {
  enter(oldState) {
    super.enter(oldState)
    console.log(oldState?.speed)
    this.oldSpeed = oldState?.speed || 0
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncAnimation(['walk', 'run', 'walkBackward'], oldState, oldAction, this.action)
    }
    this.action.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.move(delta)

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
