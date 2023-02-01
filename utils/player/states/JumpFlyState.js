import FlyState from './FlyState.js'

export default class JumpFlyState extends FlyState {
  constructor(fsm, name) {
    super(fsm, name)
    this.maxJumpTime = 25
  }

  // exit() {
  //   this.speed *= .75
  // }
}