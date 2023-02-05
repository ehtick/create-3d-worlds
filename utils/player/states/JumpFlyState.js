import FlyState from './FlyState.js'

export default class JumpFlyState extends FlyState {
  constructor(player, name) {
    super(player, name)
    this.maxJumpTime = player.maxJumpTime
  }
}