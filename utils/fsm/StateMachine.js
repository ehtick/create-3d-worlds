import * as THREE from 'three'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import JumpState from './states/JumpState.js'
import SpecialState from './states/SpecialState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  walkBackward: WalkBackwardState,
  run: RunState,
  jump: JumpState,
}

/* array of animations with proper names */
const animationsToActions = (animations, mixer) => animations.reduce((actions, clip) => ({
  ...actions,
  [clip.name]: mixer.clipAction(clip)
}), {})

/* array of animations plus dist with proper names */
const dictToActions = (animations, mixer, dict) => {
  for (const key in dict) {
    const clip = animations.find(anim => anim.name == dict[key])
    dict[key] = mixer.clipAction(clip)
  }
  return dict
}

// Player class
export default class StateMachine {
  constructor({ mesh, animations, dict }) {
    this.mesh = mesh
    this.mixer = new THREE.AnimationMixer(mesh)
    this.actions = dict
      ? dictToActions (animations, this.mixer, dict)
      : animationsToActions(animations, this.mixer)
    if (this.actions.walk) this.actions.walkBackward = this.actions.walk
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
