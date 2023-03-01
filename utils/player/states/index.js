import { jumpStyles } from '/utils/constants.js'

import IdleState from './IdleState.js'
import RunState from './RunState.js'
import WalkState from './WalkState.js'
import SpecialState from './SpecialState.js'
import JumpState from './JumpState.js'
import JumpFlyState from './JumpFlyState.js'
import FlyState from './FlyState.js'
import FallState from './FallState.js'
import WoundedState from './WoundedState.js'
import LoopState from './LoopState.js'
import DeathState from './DeathState.js'

import AIIdleState from '../ai-states/AIIdleState.js'
import WanderState from '../ai-states/WanderState.js'
import PursueState from '../ai-states/PursueState.js'
import FollowState from '../ai-states/FollowState.js'
import FleeState from '../ai-states/FleeState.js'
import PatrolState from '../ai-states/PatrolState.js'
import AttackOnceState from '../ai-states/AttackOnceState.js'
import AttackLoopState from '../ai-states/AttackLoopState.js'
import AIFallState from '../ai-states/AIFallState.js'

const playerStates = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  jump: FlyState,
  fall: FallState,
  wounded: WoundedState,
  death: DeathState,
}

const aiStates = {
  idle: AIIdleState,
  wander: WanderState,
  pursue: PursueState,
  flee: FleeState,
  patrol: PatrolState,
  follow: FollowState,
  attack: AttackOnceState,
  fall: AIFallState,
  death: DeathState,
}

const chooseJumpState = jumpStyle => {
  switch (jumpStyle) {
    case jumpStyles.FLY: return FlyState
    case jumpStyles.JUMP: return JumpState
    case jumpStyles.FLY_JUMP: return JumpFlyState
  }
}

export function getPlayerState(name, jumpStyle, attackStyle) {
  if (name === 'jump') return chooseJumpState (jumpStyle)
  if (name === 'attack' && attackStyle === 'LOOP') return LoopState
  return playerStates[name] || SpecialState
}

export function getAIState(name, jumpStyle, attackStyle) {
  if (name === 'jump') return chooseJumpState (jumpStyle)
  if (name === 'attack') return attackStyle === 'LOOP' ? AttackLoopState : AttackOnceState

  return aiStates[name] || SpecialState
}