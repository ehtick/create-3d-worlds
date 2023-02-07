import { MathUtils } from 'three'
import State from '../states/State.js'
import { RIGHT_ANGLE } from '/data/constants.js'

const { randInt } = MathUtils

export default class TurnState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.last = 0
    this.interval = randInt(1000, 2000)
  }

  update(delta, timestamp) {
    this.player.turn(Math.PI / 4 * delta)

    if (timestamp - this.last >= this.interval) {
      this.last = timestamp
      this.player.setState('idle')
    }
  }
}
