import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

const runSpeed = 4

export default class RunState extends State {
  enter(oldState) {
    this.oldSpeed = oldState.speed

    if (this.actions && this.action && this.actions[oldState.name]) {
      const oldAction = this.actions[oldState.name]
      syncAnimation('walk', oldState, oldAction, this.action)
    }

    if (!this.action) {
      this.action = this.actions.walk
      this.action.setEffectiveTimeScale(2)
    }
    this.action.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, runSpeed, this.t)

    this.turn(delta)
    this.move(delta)

    if (keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (!keyboard.capsLock) this.fsm.setState('walk')
    if (!keyboard.up) this.fsm.setState('idle')
  }

  exit() {
    this.action.setEffectiveTimeScale(1)
    this.action = null
  }
}