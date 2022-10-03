import State from './State.js'

export default class FallState extends State {
  update() {
    if (!this.fsm.inAir)
      this.fsm.setState('idle')
  }
}