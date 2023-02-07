import { MathUtils } from 'three'
import State from '../states/State.js'

const { randInt } = MathUtils

export default class IdleState extends State {
  enter(oldState, oldAction) {
    super.enter(oldState)
    this.transitFrom(oldAction, 4)
    this.last = 0
    this.interval = randInt(3000, 5000)
  }

  update(delta, timestamp) {
    if (timestamp - this.last >= this.interval) {
      this.last = timestamp
      this.player.setState('turn')
    }
  }
}
