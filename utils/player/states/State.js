import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

const { randFloat } = THREE.MathUtils

export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
    this.last = Date.now() // for ai intervals
  }

  get input() {
    return this.player.input
  }

  get actions() {
    return this.player.actions
  }

  get previousOrIdle() {
    if (this.prevState == 'pain') return 'idle' // bugfix
    return this.prevState || 'idle'
  }

  /* FSM */

  enter(oldState, oldAction) {
    // if (this.player.name == 'enemy') console.log('enter:', this.name)
    this.prevState = oldState?.name
    if (this.action) this.action.enabled = true
  }

  update(delta) {}

  exit() {
    this.action?.setEffectiveTimeScale(1)
  }

  /* ANIM HELPERS */

  findActiveAction(prevAction) {
    if (prevAction) return prevAction
    const active = this.player.mixer?._actions.filter(action => action.isRunning())
    return active?.find(a => a !== this.action)
  }

  transitFrom(prevAction, duration = .25) {
    const oldAction = this.findActiveAction(prevAction)
    if (this.action === oldAction) return

    if (this.action && oldAction) this.action.crossFadeFrom(oldAction, duration)
    this.action?.play()
  }

  syncLegs() {
    const oldAction = this.actions[this.prevState]
    const ratio = this.action.getClip().duration / oldAction.getClip().duration
    this.action.time = oldAction.time * ratio
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