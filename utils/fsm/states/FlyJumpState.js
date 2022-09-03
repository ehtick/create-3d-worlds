import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

let jumpImpulse = 0
const maxJumpImpulse = 1.25
const impulseStep = .09
const jumpStep = 2

const getSpeed = state => {
  if (state === 'walk') return 2
  if (state === 'walkBackward') return -2
  if (state === 'run') return 4
  return 0
}

export default class FlyJumpState extends State {
  enter(oldState) {
    super.enter(oldState)

    // ANIMATION
    // const curAction = this.actions.jump
    // if (oldState) {
    //   const oldAction = this.actions[oldState.name]
    //   syncFrom(['idle', 'run'], oldState, oldAction, curAction)
    // }
    // curAction.play()
  }

  jump(delta) {
    const { mesh } = this.fsm

    if (mesh.position.y < jumpImpulse)
      mesh.translateY(jumpStep * delta)
    else {
      jumpImpulse = 0
      mesh.translateY(-jumpStep * delta)
    }

    if (mesh.position.y <= 0) mesh.position.y = 0
  }

  update(delta) {
    const { mesh } = this.fsm
    this.move(delta, -1, getSpeed(this.prevState))

    if (keyboard.pressed.Space && mesh.position.y === 0 && jumpImpulse <= maxJumpImpulse)
      jumpImpulse += impulseStep
    else
      this.jump(delta)

    if (jumpImpulse === 0 && this.fsm.mesh.position.y === 0)
      this.fsm.setState(this.prevState || 'idle')
  }
}