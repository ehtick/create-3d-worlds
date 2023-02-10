import * as THREE from 'three'
import WalkState from '../states/WalkState.js'

export default class PatrolState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    this.keyboard.pressed.ArrowUp = true
    super.update(delta)
  }
}
