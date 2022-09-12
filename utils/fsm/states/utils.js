/* @param syncFrom: string or array of strings */
export const syncAnimation = (syncFrom, oldState, oldAction, curAction, duration = .75) => {
  curAction.enabled = true
  curAction.timeScale = 1

  if (syncFrom.includes(oldState.name)) {
    const ratio = curAction.getClip().duration / oldAction.getClip().duration
    curAction.time = oldAction.time * ratio // sync legs
  } else {
    curAction.time = 0.0
    curAction.setEffectiveTimeScale(1)
    curAction.setEffectiveWeight(1)
  }

  curAction.crossFadeFrom(oldAction, duration, true)
}