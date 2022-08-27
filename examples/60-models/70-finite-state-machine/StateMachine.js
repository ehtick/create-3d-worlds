import * as THREE from 'three'
import { animationsToActions } from '/utils/helpers.js'

import IdleState from './states/IdleState.js'
import WalkState from './states/WalkState.js'
import RunState from './states/RunState.js'
import SpecialState from './states/SpecialState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  special: SpecialState,
  jump: SpecialState,
  attack: SpecialState,
}

export default class StateMachine {
  constructor({ mesh, animations }) {
    this._mesh = mesh
    this._mixer = new THREE.AnimationMixer(mesh)
    this._actions = animationsToActions(animations, this._mixer)
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

  update(timeElapsedS) {
    this._currentState.update()
    this._mixer.update(timeElapsedS)
  }
}