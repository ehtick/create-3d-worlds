import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { player } = this

    this.turn(delta)
    player.applyGravity(delta)
    player.applyVelocityY()

    /* TRANSIT */

    if (player.jumpStyle === 'FLY' && this.keyboard.up)
      this.forward(delta)

    if (player.jumpStyle === 'FLY' && this.keyboard.space)
      player.setState('jump')

    if (!player.inAir)
      player.setState('idle')
  }
}