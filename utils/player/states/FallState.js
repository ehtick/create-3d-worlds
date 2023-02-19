import { jumpStyles } from '/utils/constants.js'
import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { player } = this

    player.updateTurn(delta)
    player.applyGravity(delta)
    player.applyVelocityY()

    /* TRANSIT */

    if (player.jumpStyle === jumpStyles.FLY && player.controlsUp)
      player.updateMove(delta)

    if (player.jumpStyle === jumpStyles.FLY && this.keyboard.space)
      player.setState('jump')

    if (!player.inAir)
      player.setState('idle')
  }
}