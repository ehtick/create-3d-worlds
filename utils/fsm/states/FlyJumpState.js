import * as THREE from 'three'
import State from './State.js'
import keyboard from '/utils/classes/Keyboard.js'
import { syncFrom } from './utils.js'

let jumpImpulse = 0
const maxJumpImpulse = 1.25
const impulseStep = .09

const jumpStep = 2

const getSpeed = state => {
  if (state === 'walk') return 2
  if (state === 'walkBackward') return -2
  if (state === 'run') return 4
  return 0
}

export default class FlyJumpState extends State {
  enter(oldState) {
    this.prevState = oldState.name

    const oldAction = this.actions[oldState.name]
    const curAction = this.actions[this.name]

    curAction.reset()
    curAction.setLoop(THREE.LoopOnce, 1)
    curAction.clampWhenFinished = true
    curAction.crossFadeFrom(oldAction, .25, true)
    curAction.play()
  }

  jump(delta) {
    const { mesh } = this.fsm
    // scale animation
    if (jumpImpulse) {
      const jumpTime = jumpImpulse * jumpStep
      const scale = this.actions[this.name]._clip.duration / jumpTime
      this.actions[this.name].setEffectiveTimeScale(scale)
    }

    if (mesh.position.y < jumpImpulse)
      mesh.translateY(jumpStep * delta)
    else {
      jumpImpulse = 0
      mesh.translateY(-jumpStep * delta)
    }

    if (mesh.position.y <= 0) mesh.position.y = 0
  }

  update(delta) {
    const { mesh } = this.fsm
    this.move(delta, -1, getSpeed(this.prevState))

    if (keyboard.pressed.Space && mesh.position.y === 0 && jumpImpulse <= maxJumpImpulse)
      jumpImpulse += impulseStep
    else
      this.jump(delta)

    if (jumpImpulse === 0 && this.fsm.mesh.position.y === 0)
      this.fsm.setState(this.prevState || 'idle')
  }
}