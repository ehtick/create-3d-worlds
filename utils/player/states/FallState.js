import State from './State.js'

export default class FallState extends State {
  update(delta) {
    this.freeFly(delta)
    this.turn(delta)

    if (this.player.jumpStyle === 'FLY' && this.keyboard.up)
      this.forward(delta)

    if (this.player.jumpStyle === 'FLY' && this.keyboard.space)
      this.player.setState('jump')

    if (!this.player.inAir)
      this.player.setState('idle')
  }
}