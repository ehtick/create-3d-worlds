import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

export default class IdleState extends State {

  setWeight(action) {
    action.enabled = true
    action.setEffectiveWeight(1)
    action.setEffectiveTimeScale(1)
  }

  executeCrossFade(startAction, endAction, duration) {
    // Not only the start action, but also the end action must get a weight of 1 before fading
    if (endAction) {
      this.setWeight(endAction)
      endAction.time = 0
      if (startAction)
        startAction.crossFadeTo(endAction, duration, true) // crossfade with warping
      else
        endAction.fadeIn(duration)
    } else
      startAction.fadeOut(duration)
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (oldState?.name === 'run' && !oldAction) oldAction = this.actions?.walk

    this.action.timeScale = 1

    this.prepareAction()

    if (oldAction) this.action.crossFadeFrom(oldAction, .75, true)

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, 0, this.t)

    this.turn(delta)
    this.move(delta)

    if (this.keyboard.up)
      this.fsm.setState('walk')

    if (this.keyboard.down)
      this.fsm.setState('walkBackward')

    if (this.keyboard.space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.control)
      this.fsm.setState('special')

    if (this.keyboard.backspace)
      this.fsm.setState('pain')

    if (this.keyboard.pressed.Delete)
      this.fsm.setState('death')
  }
}
