import { MathUtils } from 'three'
import State from '../states/State.js'

const { randInt } = MathUtils

export default class IdleState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, 4)
    this.last = Date.now()
    this.interval = randInt(3000, 5000)
  }

  update(delta) {
    if (Date.now() - this.last >= this.interval) {
      this.player.setState('turn')
      this.last = Date.now()
    }
  }
}
