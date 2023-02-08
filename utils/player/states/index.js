import IdleState from './IdleState.js'
import RunState from './RunState.js'
import WalkState from './WalkState.js'
import SpecialState from './SpecialState.js'
import JumpState from './JumpState.js'
import JumpFlyState from './JumpFlyState.js'
import FlyState from './FlyState.js'
import FallState from './FallState.js'

import AIIdleState from '../ai-states/AIIdleState.js'
import AIWalkState from '../ai-states/AIWalkState.js'

const playerStates = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  jump: FlyState,
  fall: FallState,
  special: SpecialState,
}

const aiStates = {
  idle: AIIdleState,
  walk: AIWalkState,
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