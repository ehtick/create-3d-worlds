import * as THREE from 'three'
import State from './State.js'

const { lerp } = THREE.MathUtils

const chooseDuration = prevState => {
  if (prevState === 'jump') return .15
  if (prevState === 'attack') return .15
  return .75
}

export default class WalkState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.action?.setEffectiveTimeScale(1)

    if (this.prevState !== 'run' || this.actions.run) {

      if (this.prevState === 'run') this.syncLegs()

      const duration = chooseDuration(oldState.name)
      if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
      else if (oldAction) oldAction.fadeOut(duration)
    }

    this.action?.play()
  }

  update(delta) {
    super.update(delta)
    this.speed = lerp(this.oldSpeed, this.fsm.speed, this.t)

    this.turn(delta)
    this.forward(delta)

    if (this.keyboard.pressed.Space)
      this.fsm.setState('jump')

    if (this.keyboard.pressed.Enter)
      this.fsm.setState('attack')

    if (this.keyboard.capsLock)
      this.fsm.setState('run')

    if (!this.keyboard.up)
      this.fsm.setState('idle')
  }
}