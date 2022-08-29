import * as THREE from 'three'
import { animationsToActions } from '/utils/helpers.js'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import SpecialState from './states/SpecialState.js'

const states = {
  idle: IdleState,
  run: RunState,
  walk: WalkState,
  walkBackward: WalkBackwardState,
}

export default class StateMachine {
  constructor({ mesh, animations, animKeys }) {
    this._mesh = mesh
    this._mixer = new THREE.AnimationMixer(mesh)
    this._actions = animationsToActions(animations, this._mixer)
    if (this._actions.walk) this._actions.walkBackward = this._actions.walk
    this.animKeys = animKeys
    this.setState('idle')
  }

  setState(name) {
    const oldState = this._currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = states[name] || SpecialState
    this._currentState = new State(this, name)
    this._currentState.enter(oldState)
  }

  update(delta) {
    this._currentState.update()
    this._mixer.update(delta)
  }
}
