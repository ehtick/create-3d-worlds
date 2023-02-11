import WalkState from '../states/WalkState.js'

export default class PursueState extends WalkState {
  enter(oldState, oldAction) {
    super.enter(oldState, oldAction)
  }

  update(delta) {
    const { mesh, target, idleDistance } = this.player

    mesh.lookAt(target.position) // looks away?
    mesh.rotateY(Math.PI)
    this.keyboard.pressed.ArrowUp = true

    if (mesh.position.distanceTo(target.position) < idleDistance)
      this.player.setState('idle')

    super.update(delta)
  }
}
