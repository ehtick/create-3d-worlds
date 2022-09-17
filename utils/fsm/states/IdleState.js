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

  enter(oldState) {
    super.enter(oldState)

    this.oldSpeed = oldState?.speed || 0
    const oldAction = (oldState?.name === 'run' && !oldState?.action)
      ? this.actions?.walk
      : oldState?.action

    this.action.enabled = true
    this.action.timeScale = 1

    // if (['walk', 'run', 'walkBackward'].includes(oldState?.name)) {
    //   const ratio = this.action.getClip().duration / oldAction.getClip().duration
    //   this.action.time = oldAction.time * ratio // sync legs
    // } else {
    this.action.time = 0.0
    this.action.setEffectiveTimeScale(1)
    this.action.setEffectiveWeight(1)
    // }

    if (oldAction)
      this.action.crossFadeFrom(oldAction, .75, true)

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
