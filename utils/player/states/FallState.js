import { jumpStyles } from '/utils/constants.js'
import State from './State.js'

export default class FallState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    if (this.actor.cameraControls) {
      this.initCameraSpeed = this.actor.cameraControls.speed
      this.actor.cameraControls.speed = this.initCameraSpeed * 3
    }
  }

  update(delta) {
    const { actor } = this

    actor.updateTurn(delta)
    actor.applyGravity(delta)
    actor.applyVelocityY()

    if (actor.jumpStyle === jumpStyles.FLY && actor.input.up)
      actor.updateMove(delta)

    /* TRANSIT */

    if (actor.jumpStyle === jumpStyles.FLY && this.input.space)
      actor.setState('jump')

    if (!actor.inAir) {
      actor.velocity.y = 0
      actor.setState('idle')
    }
  }

  exit() {
    if (this.actor.cameraControls)
      this.actor.cameraControls.speed = this.initCameraSpeed
  }
}