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
      this.action.reset()
      this.action.setLoop(THREE.LoopOnce, 1)
      this.action.clampWhenFinished = true

      this.transitFrom(oldAction)
      if (this.keyboard.down) this.reverseAction()
    } else
      this.actions[this.prevState]?.setEffectiveTimeScale(this.keyboard.down ? -1 : 1)
  }

  update(delta) {
    const { player } = this

    player.turn(delta)
    player.move(delta)
    player.applyGravity(delta)

    if (this.keyboard.space && this.jumpTime < this.maxJumpTime) {
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
}