import State from '../states/State.js'

export default class AIAttackLoopState extends State {
  constructor(...args) {
    super(...args)
    const { actions } = this.actor
    this.action = actions.attack2
      ? Math.random() > .5 ? actions.attack : actions.attack2
      : actions.attack
    this.onLoop = this.onLoop.bind(this)
    this.shouldFinish = false
  }

  enter(oldState, oldAction) {
    super.enter(oldState)
    if (this.action) this.transitFrom(oldAction, .5)
    this.actor.mixer.addEventListener('loop', this.onLoop)
    this.actor.startHit()
  }

  cleanup() {
    this.actor.mixer.removeEventListener('loop', this.onLoop)
  }

  onLoop() {
    this.actor.startHit('player')

    if (this.shouldFinish) {
      this.cleanup()
      this.actor.setState(this.prevOrIdle)
      this.shouldFinish = false
    }
  }

  update(delta) {
    const { actor } = this
    actor.thrust.addParticles(delta)

    if (actor.distancToTarget > actor.attackDistance)
      this.shouldFinish = true
  }

  exit() {
    this.cleanup()
  }
}
