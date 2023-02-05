import * as THREE from 'three'
import State from './State.js'
import { dir } from '/data/constants.js'

const { lerp } = THREE.MathUtils

export default class FlyState extends State {
  constructor(player, name) {
    super(player, name)
    this.maxJumpTime = Infinity
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    this.jumpTime = 0

    if (this.action) {
      this.action.setEffectiveTimeScale(1)
      this.action.reset()
      this.action.setLoop(THREE.LoopOnce, 1)
      this.action.clampWhenFinished = true
      if (oldAction) this.action.crossFadeFrom(oldAction, .05)
      this.action.play()
      if (this.keyboard.down) this.reverseAction()
    }

    if (!this.action)
      this.actions[this.prevState]?.setEffectiveTimeScale(this.keyboard.down ? -1 : 1)
  }

  update(delta) {
    super.update(delta)
    const { player } = this

    const speed = this.keyboard.capsLock ? this.player.speed * 2 : this.player.speed
    if (this.keyboard.up)
      this.speed = lerp(this.oldSpeed, speed, this.t)
    else if (this.keyboard.down)
      this.speed = lerp(this.oldSpeed, -speed, this.t)
    else
      this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.forward(delta)
    player.applyGravity(delta)

    if (this.keyboard.space && this.jumpTime < this.maxJumpTime) {
      if (player.velocityY < player.fallLimit * delta)
        player.velocityY += player.jumpForce * delta
      this.jumpTime++
    }

    if (player.velocityY > 0 && this.directionBlocked(dir.up))
      player.velocityY = -player.velocityY

    player.applyVelocity()

    /* TRANSIT */

    if (player.velocityY <= 0 && !player.inAir) {
      player.velocityY = 0
      player.setState(this.prevState) // bez prevState brlja aktivne animacije
    }
  }
}