import State from './State.js'

export default class SideWalkState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.actions.walk.setEffectiveTimeScale(1)
    this.actions.walk.play()
  }

  update(delta) {
    super.update(delta)

    this.turn(delta)

    if (this.keyboard.pressed.KeyQ)
      this.side(delta, -1)

    if (this.keyboard.pressed.KeyE)
      this.side(delta, 1)

    if (this.keyboard.up)
      this.forward(delta)

    if (this.keyboard.down)
      this.backward(delta)

    if (this.fsm.inAir)
      this.fsm.setState('fall')

    if (this.keyboard.space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (!this.keyboard.pressed.KeyQ && !this.keyboard.pressed.KeyE)
      this.fsm.setState('idle')
  }
}