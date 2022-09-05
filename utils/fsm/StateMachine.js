import * as THREE from 'three'

import IdleState from './states/IdleState.js'
import RunState from './states/RunState.js'
import WalkState from './states/WalkState.js'
import WalkBackwardState from './states/WalkBackwardState.js'
import SpecialState from './states/SpecialState.js'
import JumpState from './states/JumpState.js'
import FlyJumpState from './states/FlyJumpState.js'

const states = {
  idle: IdleState,
  walk: WalkState,
  walkBackward: WalkBackwardState,
  run: RunState,
  jump: FlyJumpState,
}

/* map animations with states */
const mapAnims = (animations, mixer, dict) => {
  for (const key in dict) {
    const clip = animations.find(anim => anim.name == dict[key])
    dict[key] = mixer.clipAction(clip)
  }
  return dict
}

export default class StateMachine {
  constructor({ mesh, animations, dict }) {
    this.mesh = mesh
    this.mixer = new THREE.AnimationMixer(mesh.isGroup ? mesh.children[0] : mesh)
    this.actions = mapAnims(animations, this.mixer, dict)
    if (this.actions?.walk) this.actions.walkBackward = this.actions.walk
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
