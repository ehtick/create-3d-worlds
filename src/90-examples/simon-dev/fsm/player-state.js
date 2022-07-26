import * as THREE from '/node_modules/three127/build/three.module.js'

export const player_state = (() => {

  class State {
    constructor(parent) {
      this.parent = parent
    }

    Enter() {}
    Exit() {}
    Update() {}
  };

  class DeathState extends State {
    constructor(parent) {
      super(parent)

      this._action = null
    }

    get Name() {
      return 'death'
    }

    Enter(prevState) {
      this._action = this.parent.animations.death.action

      this._action.reset()
      this._action.setLoop(THREE.LoopOnce, 1)
      this._action.clampWhenFinished = true

      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action

        this._action.crossFadeFrom(prevAction, 0.2, true)
        this._action.play()
      } else
        this._action.play()

    }

    Exit() {}

    Update(_) {}
  };

  class DanceState extends State {
    constructor(parent) {
      super(parent)

      this._action = null

      this._FinishedCallback = () => {
        this._Finished()
      }
    }

    get Name() {
      return 'dance'
    }

    Enter(prevState) {
      this._action = this.parent.animations.dance.action
      const mixer = this._action.getMixer()
      mixer.addEventListener('finished', this._FinishedCallback)

      this._action.reset()
      this._action.setLoop(THREE.LoopOnce, 1)
      this._action.clampWhenFinished = true

      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action

        this._action.crossFadeFrom(prevAction, 0.2, true)
        this._action.play()
      } else
        this._action.play()

    }

    _Finished() {
      this._Cleanup()
      this.parent.SetState('idle')
    }

    _Cleanup() {
      if (this._action)
        this._action.getMixer().removeEventListener('finished', this._FinishedCallback)

    }

    Exit() {
      this._Cleanup()
    }

    Update(_) {}
  };

  class AttackState extends State {
    constructor(parent) {
      super(parent)

      this._action = null

      this._FinishedCallback = () => {
        this._Finished()
      }
    }

    get Name() {
      return 'attack'
    }

    Enter(prevState) {
      this._action = this.parent.animations.attack.action
      const mixer = this._action.getMixer()
      mixer.addEventListener('finished', this._FinishedCallback)

      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action

        this._action.reset()
        this._action.setLoop(THREE.LoopOnce, 1)
        this._action.clampWhenFinished = true
        this._action.crossFadeFrom(prevAction, 0.4, true)
        this._action.play()
      } else
        this._action.play()

    }

    _Finished() {
      this._Cleanup()
      this.parent.SetState('idle')
    }

    _Cleanup() {
      if (this._action)
        this._action.getMixer().removeEventListener('finished', this._FinishedCallback)

    }

    Exit() {
      this._Cleanup()
    }

    Update(_) {}
  };

  class WalkState extends State {
    get Name() {
      return 'walk'
    }

    Enter(prevState) {
      const curAction = this.parent.animations.walk.action
      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action

        curAction.enabled = true

        if (prevState.Name == 'run') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration
          curAction.time = prevAction.time * ratio
        } else {
          curAction.time = 0.0
          curAction.setEffectiveTimeScale(1.0)
          curAction.setEffectiveWeight(1.0)
        }

        curAction.crossFadeFrom(prevAction, 0.1, true)
        curAction.play()
      } else
        curAction.play()
    }

    Exit() {}

    Update(timeElapsed, input) {
      if (!input)
        return

      if (input.keys.up || input.keys.down) {
        if (input.keys.capsLock)
          this.parent.SetState('run')

        return
      }

      this.parent.SetState('idle')
    }
  };

  class RunState extends State {
    get Name() {
      return 'run'
    }

    Enter(prevState) {
      const curAction = this.parent.animations.run.action
      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action

        curAction.enabled = true

        if (prevState.Name == 'walk') {
          const ratio = curAction.getClip().duration / prevAction.getClip().duration
          curAction.time = prevAction.time * ratio
        } else {
          curAction.time = 0.0
          curAction.setEffectiveTimeScale(1.0)
          curAction.setEffectiveWeight(1.0)
        }

        curAction.crossFadeFrom(prevAction, 0.1, true)
        curAction.play()
      } else
        curAction.play()

    }

    Exit() {}

    Update(timeElapsed, input) {
      if (!input) return

      if (input.keys.up || input.keys.down) {
        if (!input.keys.capsLock)
          this.parent.SetState('walk')
        return
      }

      this.parent.SetState('idle')
    }
  };

  class IdleState extends State {
    get Name() {
      return 'idle'
    }

    Enter(prevState) {
      const idleAction = this.parent.animations.idle.action
      if (prevState) {
        const prevAction = this.parent.animations[prevState.Name].action
        idleAction.time = 0.0
        idleAction.enabled = true
        idleAction.setEffectiveTimeScale(1.0)
        idleAction.setEffectiveWeight(1.0)
        idleAction.crossFadeFrom(prevAction, 0.25, true)
        idleAction.play()
      } else
        idleAction.play()

    }

    Exit() {}

    Update(_, input) {
      if (!input) return

      if (input.keys.up || input.keys.down)
        this.parent.SetState('walk')
      else if (input.keys.space)
        this.parent.SetState('attack')
      else if (input.keys.backspace)
        this.parent.SetState('dance')
    }
  };

  return {
    State,
    DanceState,
    AttackState,
    IdleState,
    WalkState,
    RunState,
    DeathState,
  }

})()