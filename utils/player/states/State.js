import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

const { randFloat, randInt } = THREE.MathUtils

export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
    this.last = Date.now() // for ai intervals
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
    return this.player.mixer?._actions.filter(action => action.isRunning())
  }

  findActiveAction(prevAction) {
    if (prevAction) return prevAction
    return this.activeActions?.find(a => a !== this.action)
  }

  transitFrom(prevAction, duration = .25) {
    const oldAction = this.findActiveAction(prevAction)
    // if (!oldAction) this.player.mixer?.stopAllAction()
    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
    this.action?.play()
  }

  // https://gist.github.com/rtpHarry/2d41811d04825935039dfc075116d0ad
  reverseAction(action = this.action) {
    if (!action) return
    if (action.time === 0)
      action.time = action.getClip().duration
    action.paused = false
    action.setEffectiveTimeScale(-1)
  }

  /* AI HELPERS */

  turnPeriodically(interval, angle = Math.PI / 2) {
    if (Date.now() - this.last >= interval) {
      new TWEEN.Tween(this.player.mesh.rotation)
        .to({ y: randFloat(-angle, angle) }, interval / 2)
        .start()
      this.last = Date.now()
    }
  }
}