import SpecialState from './SpecialState.js'

export default class AttackOnceState extends SpecialState {
  enter(oldState, oldAction) {
    const { player } = this
    super.enter(oldState, oldAction)

    const object = player.kick()
    setTimeout(() => {
      player.hit(object)
    }, this.action.getClip().duration * 500)
  }
}