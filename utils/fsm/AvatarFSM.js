import PlayerFSM from './PlayerFSM.js'
import { camera, clock } from '/utils/scene.js'
import { createAvatar, updateAvatar, uniforms, skins } from '/utils/geometry/avatar.js'

export default class AvatarFSM extends PlayerFSM {
  constructor() {
    super({ mesh: createAvatar(), camera, jumpStyle: 'FLY', speed: 4 })
  }

  walkAnim() {
    const r = this.size * .5
    const speedFactor = this.running ? 9 : 6
    const elapsed = Math.sin(clock.getElapsedTime() * speedFactor) * r
    updateAvatar(this.mesh, elapsed)
  }

  update(delta) {
    super.update(delta)

    if (this.keyboard.up) this.walkAnim()
  }
}
