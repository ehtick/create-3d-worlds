import FlyState from './FlyState.js'

export default class JumpFlyState extends FlyState {
  constructor(fsm, name) {
    super(fsm, name)
    this.maxVelocity = .15
    this.maxJumpTime = 15
  }

  // exit() {
  //   this.speed *= .75
  // }
}