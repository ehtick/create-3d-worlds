import * as THREE from 'three'
import State, { GRAVITY } from './State.js'
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
    const speed = this.keyboard.capsLock ? this.player.speed * 2 : this.player.speed

    if (this.keyboard.up)
      this.speed = lerp(this.oldSpeed, speed, this.t)
    else if (this.keyboard.down)
      this.speed = lerp(this.oldSpeed, -speed, this.t)
    else
      this.speed = lerp(this.oldSpeed, 0, this.t)

    const { mesh } = this.player
    const gravityStep = GRAVITY * delta

    if (this.player.velocityY - gravityStep >= this.player.minVelocityY)
      this.player.velocityY -= gravityStep

    if (this.player.velocityY > 0 && this.directionBlocked(dir.up))
      return

    mesh.translateY(this.player.velocityY)

    if (!this.player.inAir && !this.keyboard.space)
      mesh.position.y = this.player.groundY

    this.turn(delta)
    this.forward(delta)

    const flyStep = GRAVITY * 2 * delta

    if (this.keyboard.space && this.jumpTime < this.maxJumpTime) {
      this.player.velocityY += flyStep
      this.jumpTime++

      if (this.player.velocityY > this.player.maxVelocityY)
        this.player.velocityY = this.player.maxVelocityY
    }

    if (this.player.velocityY <= 0 && !this.player.inAir)
      this.player.setState(this.prevState) // bez prevState brlja aktivne animacije
  }
}