import State from '../states/State.js'

export default class AIAttackLoopState extends State {
  constructor(...args) {
    super(...args)
    const { actions } = this.player
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
    this.onLoop = this.onLoop.bind(this)
    this.shouldFinish = false
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
    this.player.mixer.addEventListener('loop', this.onLoop)
    this.player.closeAttack()
  }

  cleanup() {
    this.player.mixer.removeEventListener('loop', this.onLoop)
  }

  onLoop() {
    this.player.closeAttack()

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
