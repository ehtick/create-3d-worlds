import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState) {
    if (oldState?.name === 'run') this.fsm.mixer.stopAllAction() // fix
    super.enter(oldState)
    this.speed = oldState.speed
  }

  update(delta) {
    this.move(delta)
  }

  exit() {
    this.speed *= .75
  }
}