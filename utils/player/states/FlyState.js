import * as THREE from 'three'
import State from './State.js'
import { dir } from '/utils/constants.js'

export default class FlyState extends State {
  constructor(player, name) {
    super(player, name)
    this.maxJumpTime = Infinity
  }

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.jumpTime = 0

    if (this.action) {
      this.action.reset()
      this.action.setLoop(THREE.LoopOnce, 1)
      this.action.clampWhenFinished = true
      this.transitFrom(oldAction, .5)
    }

    if (this.player.input.down) this.reverseAction()

    if (this.player.thirdPersonCamera) {
      this.initCameraSpeed = this.player.thirdPersonCamera.speed
      this.player.thirdPersonCamera.speed = this.initCameraSpeed * 3
    }
  }

  update(delta) {
    const { player } = this

    player.updateTurn(delta)
    player.updateMove(delta)
    player.applyGravity(delta)

    if (this.input.space && this.jumpTime < this.maxJumpTime) {
      if (player.velocity.y < player.fallLimit * delta)
        player.velocity.y += player.jumpForce * delta
      this.jumpTime++
    }

    if (player.velocity.y > 0 && player.directionBlocked(dir.up))
      player.velocity.y = -player.velocity.y

    player.applyVelocityY()

    /* TRANSIT */

    if (player.velocity.y <= 0 && !player.inAir) {
      player.velocity.y = 0
      player.setState(this.prevState) // bez prevState brlja aktivne animacije
    }
  }

  exit() {
    this.action?.setEffectiveTimeScale(1)
    if (this.player.thirdPersonCamera)
      this.player.thirdPersonCamera.speed = this.initCameraSpeed
  }
}