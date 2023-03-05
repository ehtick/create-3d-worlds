import { jumpStyles } from '/utils/constants.js'
import State from './State.js'

export default class FallState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    if (this.player.thirdPersonCamera) {
      this.initCameraSpeed = this.player.thirdPersonCamera.speed
      this.player.thirdPersonCamera.speed = this.initCameraSpeed * 3
    }
  }

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

  exit() {
    if (this.player.thirdPersonCamera)
      this.player.thirdPersonCamera.speed = this.initCameraSpeed
  }
}