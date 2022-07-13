/* @param name: string or array of strings */
export const syncFrom = (name, oldState, oldAction, curAction, duration = .5) => {
  curAction.enabled = true
  if (name.includes(oldState.name)) {
    const ratio = curAction.getClip().duration / oldAction.getClip().duration
    curAction.time = oldAction.time * ratio // sync legs
  } else {
    curAction.time = 0.0
    curAction.setEffectiveTimeScale(1)
    curAction.setEffectiveWeight(1)
  }
  curAction.crossFadeFrom(oldAction, duration, true)
}