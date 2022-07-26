import { FiniteStateMachine } from '../fsm/finite-state-machine.js'
import { player_state } from '../fsm/player-state.js'

export class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super()
    this._proxy = proxy
    this.Init_()
  }

  Init_() {
    this._AddState('idle', player_state.IdleState)
    this._AddState('walk', player_state.WalkState)
    this._AddState('run', player_state.RunState)
    this._AddState('attack', player_state.AttackState)
    this._AddState('death', player_state.DeathState)
    this._AddState('dance', player_state.DanceState)
  }
};
