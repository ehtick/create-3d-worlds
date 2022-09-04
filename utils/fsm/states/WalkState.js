import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

const walkSpeed = 2

export default class WalkState extends State {
  enter(oldState) {
    this.speed = (oldState.name === 'idle') ? 0 : walkSpeed
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, this.action)
    }
    this.action.play()
  }

  update(delta) {
    this.turn(delta)
    this.move(delta, -1, Math.min(this.speed += .05, walkSpeed))

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (keyboard.capsLock)
      this.fsm.setState('run')

    if (!keyboard.up) this.fsm.setState('idle')
  }
}