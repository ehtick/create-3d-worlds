import State from '../states/State.js'

export default class AIFallState extends State {
  update(delta) {
    const { player } = this

    player.updateTurn(delta)
    player.applyGravity(delta)
    player.applyVelocityY()

    /* TRANSIT */

    if (!player.inAir)
      player.setState(this.prevOrIdle)
  }
}