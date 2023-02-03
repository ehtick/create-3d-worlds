import IdleState from './IdleState.js'
import RunState from './RunState.js'
import WalkState from './WalkState.js'
import SpecialState from './SpecialState.js'
import JumpState from './JumpState.js'
import JumpFlyState from './JumpFlyState.js'
import FlyState from './FlyState.js'
import FallState from './FallState.js'

export const states = {
  idle: IdleState,
  walk: WalkState,
  run: RunState,
  jump: FlyState,
  fall: FallState,
  special: SpecialState,
}

export const jumpStyles = {
  FLY: 'FLY',
  JUMP: 'JUMP',
  FLY_JUMP: 'FLY_JUMP',
}

export const chooseJumpState = jumpStyle => {
  switch (jumpStyle) {
    case jumpStyles.FLY: return FlyState
    case jumpStyles.JUMP: return JumpState
    case jumpStyles.FLY_JUMP: return JumpFlyState
  }
}
