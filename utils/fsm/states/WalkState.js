import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

let speed = 0
const walkSpeed = 2

export default class WalkState extends State {
  enter(oldState) {
    speed = (oldState.name === 'idle') ? 0 : walkSpeed
    const curAction = this.actions.walk
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  update(delta) {
    this.turn(delta)
    speed = Math.min(speed + .05, walkSpeed)
    this.move(delta, -1, speed)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (keyboard.capsLock)
      this.fsm.setState('run')

    if (!keyboard.up) this.fsm.setState('idle')
  }
}