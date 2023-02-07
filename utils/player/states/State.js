export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
  }

  get keyboard() {
    return this.player.keyboard
  }

  get actions() {
    return this.player.actions
  }

  enter(oldState) {
    this.prevState = oldState?.name
    if (this.action) this.action.enabled = true
  }

  update(delta) {}

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }

  /* ANIM HELPERS */

  get activeActions() {
    return this.player.mixer._actions.filter(action => action.isRunning())
  }

  findPrevAction(prevAction) {
    if (prevAction) return prevAction
    return this.activeActions.find(a => a !== this.action)
  }

  stopBacklogs(prevAction) {
    const actions = this.activeActions.filter(a => a !== this.action && a !== prevAction)
    actions.forEach(action => {
      action.stop()
    })
  }

  transitFrom(prevAction, duration = .25) {
    const oldAction = this.findPrevAction(prevAction)

    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)

    // BUG: zaostaju stare akcije
    // this.player.mixer?.stopAllAction()
    // this.stopBacklogs(oldAction)

    if (this.action) this.action.play()
  }

  // https://gist.github.com/rtpHarry/2d41811d04825935039dfc075116d0ad
  reverseAction(action = this.action) {
    if (!action) return
    if (action.time === 0)
      action.time = action.getClip().duration
    action.paused = false
    action.setEffectiveTimeScale(-1)
  }
}