import { MathUtils } from 'three'
import State from '../states/State.js'

const { randInt } = MathUtils

export default class TurnState extends State {
  enter(oldState) {
    super.enter(oldState)
    this.last = Date.now()
    this.interval = randInt(500, 1000)
  }

  update(delta) {
    this.player.turn(Math.PI / 8 * delta)

    if (Date.now() - this.last >= this.interval) {
      this.player.setState('idle')
      this.last = Date.now()
    }
  }
}
