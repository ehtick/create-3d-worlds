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

  transitFrom(oldAction, duration = .25) {
    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
    // if (!oldAction) this.player.mixer?.stopAllAction()
    if (this.action) this.action.play()

    // if (!this.action && oldAction) oldAction.fadeOut(.5)
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