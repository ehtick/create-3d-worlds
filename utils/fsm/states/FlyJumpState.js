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
    this.onGround = false

    // ANIMATION
    const curAction = this.actions.jump
    if (oldState) {
      const oldAction = this.actions[oldState.name]
      syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    }
    curAction.play()
  }

  checkGround() {
    if (this.fsm.mesh.position.y < 0) {
      this.fsm.mesh.position.y = 0
      this.onGround = true
    }
  }

  update(delta) {
    this.move(delta, -1, getSpeed(this.prevState))

    if (keyboard.pressed.Space)
      this.fsm.mesh.translateY(.1)
    else
      this.fsm.mesh.translateY(-.1)

    this.checkGround()

    if (this.onGround)
      this.fsm.setState(this.prevState || 'idle')
  }
}