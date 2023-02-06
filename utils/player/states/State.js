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

  get joystick() {
    return this.player.joystick
  }

  get actions() {
    return this.player.actions
  }

  enter(oldState) {
    this.prevState = oldState?.name
    if (this.action) this.action.enabled = true
  }

  update() {}

  exit() { }

  /* HELPERS */

  transitFrom(oldAction, duration = .25) {
    this.action?.setEffectiveTimeScale(1)

    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
    if (!oldAction) this.player.mixer?.stopAllAction()
    if (this.action) this.action.play()

    // if (!this.action && oldAction) oldAction.fadeOut(.5)
  }

  syncTime(oldAction) {
    if (!this.action || !oldAction) return
    const ratio = this.action.getClip().duration / oldAction.getClip().duration
    this.action.time = oldAction.time * ratio
  }

  // https://gist.github.com/rtpHarry/2d41811d04825935039dfc075116d0ad
  reverseAction() {
    if (!this.action) return
    if (this.action.time === 0)
      this.action.time = this.action.getClip().duration
    this.action.paused = false
    this.action.setEffectiveTimeScale(-1)
  }
}