import SpecialState from './SpecialState.js'
import { belongsTo } from '/utils/helpers.js'

export default class AttackOnceState extends SpecialState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.halfAction = this.action.getClip().duration * 500
    this.done = false
  }

  update() {
    if (this.done) return

    const object = this.player.raycast()
    if (!belongsTo(object, 'enemy')) return

    setTimeout(() => {
      this.player.hit(object) // reaction
    }, this.halfAction)
    this.done = true
  }
}