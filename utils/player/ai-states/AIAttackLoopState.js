import State from '../states/State.js'
import { belongsTo } from '/utils/helpers.js'

export default class AIAttackLoopState extends State {
  constructor(...args) {
    super(...args)
    const { actions } = this.player
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
    this.halfAction = this.action.getClip().duration * 500
    this.onLoop = this.onLoop.bind(this)
    this.shouldFinish = false
  }

  attack() {
    this.player.lookAtTarget()
    const object = this.player.raycast()
    if (!belongsTo(object, 'player')) return

    setTimeout(() => {
      this.player.hit(object)
    }, this.halfAction)
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
    this.player.mixer.addEventListener('loop', this.onLoop)
    this.attack()
  }

  cleanup() {
    this.player.mixer.removeEventListener('loop', this.onLoop)
  }

  onLoop() {
    this.attack()

    if (!this.shouldFinish) return
    this.cleanup()
    this.player.setState(this.prevOrIdle)
    this.shouldFinish = false
  }

  update() {
    const { player } = this

    player.lookAtTarget()

    if (player.distancToTarget > player.attackDistance)
      this.shouldFinish = true
  }

  exit() {
    this.cleanup()
  }
}
