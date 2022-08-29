import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

export default class WalkBackwardState extends State {
  enter(oldState) {
    const curAction = this.actions.walk
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle'], oldState, oldAction, curAction)
    }
    curAction.play()
    curAction.timeScale = -1
  }

  update() {
    if (keyboard.down) return

    this.fsm.setState('idle')
  }
}
