import { FiniteStateMachine } from '../fsm/finite-state-machine.js'
import { player_state } from '../fsm/player-state.js'

export class CharacterFSM extends FiniteStateMachine {
  constructor(animations) {
    super()
    this.animations = animations
    this.Init()
  }

  Init() {
    this.AddState('idle', player_state.IdleState)
    this.AddState('walk', player_state.WalkState)
    this.AddState('run', player_state.RunState)
    this.AddState('attack', player_state.AttackState)
    this.AddState('death', player_state.DeathState)
    this.AddState('dance', player_state.DanceState)
  }
};
