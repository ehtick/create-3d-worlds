import SpecialState from './SpecialState.js'

export default class JumpState extends SpecialState {

  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
    this.speed = oldState.speed
    // https://gist.github.com/rtpHarry/2d41811d04825935039dfc075116d0ad
    if (oldState.name === 'walkBackward') {
      this.action.setEffectiveTimeScale(-1)
      if (this.action.time === 0)
        this.action.time = this.action.getClip().duration
    }
  }

  update(delta) {
    this.forward(delta, this.prevState === 'walkBackward' ? 1 : -1)
  }

  exit() {
    this.speed *= .75
    this.action.setEffectiveTimeScale(1)
  }
}