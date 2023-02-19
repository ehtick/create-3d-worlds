import IdleState from './IdleState.js'
import RunState from './RunState.js'
import WalkState from './WalkState.js'
import SpecialState from './SpecialState.js'
import JumpState from './JumpState.js'
import JumpFlyState from './JumpFlyState.js'
import FlyState from './FlyState.js'
import FallState from './FallState.js'
import WoundedState from './WoundedState.js'

import AIIdleState from '../ai-states/AIIdleState.js'
import WanderState from '../ai-states/WanderState.js'
import PursueState from '../ai-states/PursueState.js'
import FollowState from '../ai-states/FollowState.js'
import FleeState from '../ai-states/FleeState.js'
import PatrolState from '../ai-states/PatrolState.js'
import AIWalkState from '../ai-states/AIWalkState.js'
import AIAttackState from '../ai-states/AIAttackState.js'

const playerStates = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  jump: FlyState,
  fall: FallState,
  wounded: WoundedState,
}

const aiStates = {
  idle: AIIdleState,
  walk: AIWalkState,
  wander: WanderState,
  pursue: PursueState,
  flee: FleeState,
  patrol: PatrolState,
  follow: FollowState,
  attack: AIAttackState,
}

export const jumpStyles = {
  FLY: 'FLY',
  JUMP: 'JUMP',
  FLY_JUMP: 'FLY_JUMP',
}

const chooseJumpState = jumpStyle => {
  switch (jumpStyle) {
    case jumpStyles.FLY: return FlyState
    case jumpStyles.JUMP: return JumpState
    case jumpStyles.FLY_JUMP: return JumpFlyState
  }
}

export function getPlayerState(name, jumpStyle) {
  if (name === 'jump') return chooseJumpState (jumpStyle)
  return playerStates[name] || SpecialState
}

export function getAIState(name, jumpStyle) {
  if (name === 'jump') return chooseJumpState (jumpStyle)
  return aiStates[name] || SpecialState
}