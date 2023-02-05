import State from './State.js'

export default class FallState extends State {
  update(delta) {
    const { player } = this

    const gravityDelta = player.gravity * delta
    const velocityLimit = player.fallLimit * delta

    if (player.velocityY > -velocityLimit)
      player.velocityY -= gravityDelta

    if (player.mesh.position.y + player.velocityY > player.groundY)
      player.mesh.translateY(player.velocityY)
    else
      player.position.y = player.groundY

    this.turn(delta)

    if (player.jumpStyle === 'FLY' && this.keyboard.up)
      this.forward(delta)

    if (player.jumpStyle === 'FLY' && this.keyboard.space)
      player.setState('jump')

    if (!player.inAir)
      player.setState('idle')
  }
}