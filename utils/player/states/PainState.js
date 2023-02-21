import SpecialState from './SpecialState.js'

export default class PainState extends SpecialState {

  enter(oldState, oldAction) {
    this.player.mesh.userData.energy -= 10
    super.enter(oldState, oldAction)
  }

  exit() {
    super.exit()
  }
}