import * as THREE from '/node_modules/three127/build/three.module.js'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import SpecialState from './states/SpecialState.js'
import SpecialMirrorState from './states/SpecialMirrorState.js'
import keyboard from '/classes/Keyboard.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  'walk backward': WalkBackwardState,
  'Esquiva Left': SpecialMirrorState,
}

export default class StateMachine {
  constructor({ mesh, animations }) {
    this._mesh = mesh
    this._mixer = new THREE.AnimationMixer(mesh)
    this._actions = animations.reduce((dict, clip) => ({
      ...dict,
      [clip.name]: this._mixer.clipAction(clip)
    }), {})
    this.setState('idle')
  }

  setState(name) {
    const oldState = this._currentState
    if (oldState) {
      if (oldState.name == name) return
      oldState.exit()
    }
    const State = states[name] || (keyboard.capsLock ? SpecialMirrorState : SpecialState)
    this._currentState = new State(this, name)
    this._currentState.enter(oldState)
  }

  update(timeElapsedS) {
    this._currentState.update()
    this._mixer.update(timeElapsedS)
  }
};
