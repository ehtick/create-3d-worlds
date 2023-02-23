import { jumpStyles } from '/utils/constants.js'
import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { player } = this

    player.updateTurn(delta)
    player.applyGravity(delta)
    player.applyVelocityY()

    if (player.jumpStyle === jumpStyles.FLY && player.input.up)
      player.updateMove(delta)

    /* TRANSIT */

    if (player.jumpStyle === jumpStyles.FLY && this.input.space)
      player.setState('jump')

    if (!player.inAir)
      player.setState('idle')
  }
}