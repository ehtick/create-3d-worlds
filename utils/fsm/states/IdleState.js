import State from './State.js'
import { syncAnimation } from './utils.js'
import { lerp } from '/utils/helpers.js'

export default class IdleState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.oldSpeed = oldState?.speed || 0

    let oldAction = this.actions[oldState?.name]
    if (!oldAction && oldState?.name === 'run') oldAction = this.actions?.walk

    if (this.actions && oldAction && this.action)
      syncAnimation(['walk', 'run', 'walkBackward'], oldState, oldAction, this.action)

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.up)
      this.fsm.setState('walk')

    if (this.keyboard.down)
      this.fsm.setState('walkBackward')

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.pressed.ControlLeft)
      this.fsm.setState('special')

    if (this.keyboard.pressed.Delete)
      this.fsm.setState('death')
  }
}
