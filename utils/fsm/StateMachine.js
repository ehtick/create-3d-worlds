import * as THREE from 'three'
import { animationsToActions } from '/utils/helpers.js'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import SpecialState from './states/SpecialState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  walkBackward: WalkBackwardState,
  run: RunState,
}

export default class StateMachine {
  constructor({ mesh, animations, animKeys }) {
    this.mesh = mesh
    this.mixer = new THREE.AnimationMixer(mesh)
    this.actions = animationsToActions(animations, this.mixer)
    if (this.actions.walk) this.actions.walkBackward = this.actions.walk
    this.animKeys = animKeys
    this.setState('idle')
  }

  setState(name) {
    const oldState = this.currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = states[name] || SpecialState
    this.currentState = new State(this, name)
    this.currentState.enter(oldState)
  }

  update(delta) {
    this.currentState.update(delta)
    this.mixer.update(delta)
  }
}
